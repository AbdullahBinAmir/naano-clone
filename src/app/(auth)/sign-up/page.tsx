"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <GlassCard strong className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-foreground-muted">Start as a creator or a brand — you can switch later.</p>
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Account created (demo mode — no real auth yet)");
          router.push("/onboarding");
        }}
      >
        <input required placeholder="Full name" className="input" />
        <input required type="email" placeholder="Email" className="input" />
        <input required type="password" placeholder="Password" className="input" />
        <Button type="submit" variant="primary" className="mt-2">
          Create account
        </Button>
      </form>
      <p className="text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}
