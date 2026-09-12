"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();

  return (
    <GlassCard strong className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground-muted">Sign in to your Naano workspace.</p>
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Signed in (demo mode — no real auth yet)");
          router.push("/dashboard/creator/overview");
        }}
      >
        <input required type="email" placeholder="Email" className="input" />
        <input required type="password" placeholder="Password" className="input" />
        <Button type="submit" variant="primary" className="mt-2">
          Sign in
        </Button>
      </form>
      <p className="text-center text-sm text-foreground-muted">
        New to Naano?{" "}
        <Link href="/sign-up" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </GlassCard>
  );
}
