import { PageHeader } from "@/components/layout/page-header";
import { AccountCard } from "@/components/settings/account-card";
import { CreatorSettingsForm } from "@/components/settings/creator-settings-form";
import { PasswordForm } from "@/components/settings/password-form";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export default async function CreatorSettingsPage() {
  const { user, profile } = await requireProfile("creator");
  const supabase = await createClient();
  const { data } = await supabase
    .from("creator_profiles")
    .select("display_name, linkedin_public_url, avatar_url")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and account." />
      <CreatorSettingsForm userId={user.id} avatarUrl={data?.avatar_url ?? ""} displayName={data?.display_name ?? ""} linkedinPublicUrl={data?.linkedin_public_url ?? ""} />
      <PasswordForm />
      <AccountCard email={profile.email} role="creator" />
    </>
  );
}
