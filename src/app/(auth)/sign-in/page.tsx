import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/auth/safe-next";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  const { next, notice } = await searchParams;
  return <SignInForm next={safeNextPath(next)} notice={notice ?? null} />;
}
