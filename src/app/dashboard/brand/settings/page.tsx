import { PageHeader } from "@/components/layout/page-header";
import { AccountCard } from "@/components/settings/account-card";
import { BrandSettingsForm } from "@/components/settings/brand-settings-form";
import { PasswordForm } from "@/components/settings/password-form";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export default async function BrandSettingsPage() {
  const { user, profile } = await requireProfile("brand");
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_profiles")
    .select("company_name, industry")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <>
      <PageHeader title="Settings" description="Manage your company profile and account." />
      <BrandSettingsForm companyName={data?.company_name ?? ""} industry={data?.industry ?? ""} />
      <PasswordForm />
      <AccountCard email={profile.email} role="brand" />
    </>
  );
}
