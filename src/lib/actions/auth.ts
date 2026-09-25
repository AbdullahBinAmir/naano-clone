"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, onboardingSchema, signInSchema, signUpSchema, updatePasswordSchema } from "@/lib/validations/auth";
import { getRequestOrigin } from "@/lib/auth/origin";
import { redeemReferralCode } from "@/lib/actions/affiliate-helpers";
import { REFERRAL_CODE_COOKIE } from "@/lib/constants";
import type { AppRole } from "@/types/database";

export interface AuthActionResult {
  error?: string;
  /** Per-field messages from validation, keyed by input name. */
  fieldErrors?: Record<string, string>;
  needsEmailConfirmation?: boolean;
  role?: AppRole | null;
}

function validationFailure(issues: { path: PropertyKey[]; message: string }[]): AuthActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { error: issues[0]?.message ?? "Invalid input", fieldErrors };
}

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "creator"
  );
}

export async function signUpAction(input: { fullName: string; email: string; password: string }): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    // Email confirmation is required by the Supabase project's auth settings.
    return { needsEmailConfirmation: true };
  }
  return {};
}

export async function signInAction(input: { email: string; password: string }): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  return { role: profile?.role ?? null };
}

export async function requestPasswordResetAction(input: { email: string }): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  // Don't reveal whether the address has an account; only surface delivery/rate-limit failures.
  if (error && error.status === 429) return { error: "Too many requests. Please wait a minute and try again." };
  return {};
}

export async function updatePasswordAction(input: { password: string; confirmPassword: string }): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "This reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { role: profile?.role ?? null };
}

export async function resendConfirmationAction(input: { email: string }): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` },
  });
  if (error) return { error: error.message };
  return {};
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function completeOnboardingAction(input: { role: "creator" | "brand" }): Promise<AuthActionResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim() || user.email!.split("@")[0];

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    role: parsed.data.role,
    email: user.email!,
  });
  if (profileError) return { error: profileError.message };

  if (parsed.data.role === "creator") {
    const handle = `${slugify(fullName)}-${user.id.slice(0, 6)}`;
    const { error: creatorError } = await supabase.from("creator_profiles").insert({
      profile_id: user.id,
      handle,
      display_name: fullName,
      headline: "New on Naano — headline coming soon.",
    });
    if (creatorError) return { error: creatorError.message };

    const { error: cardError } = await supabase.from("creator_cards").insert({
      creator_profile_id: user.id,
      card_slug: handle,
    });
    if (cardError) return { error: cardError.message };
  } else {
    const { error: brandError } = await supabase.from("brand_profiles").insert({
      profile_id: user.id,
      company_name: fullName,
    });
    if (brandError) return { error: brandError.message };
  }

  const cookieStore = await cookies();
  const referralCode = cookieStore.get(REFERRAL_CODE_COOKIE)?.value;
  if (referralCode) {
    await redeemReferralCode(supabase, referralCode);
    cookieStore.delete(REFERRAL_CODE_COOKIE);
  }

  return { role: parsed.data.role };
}
