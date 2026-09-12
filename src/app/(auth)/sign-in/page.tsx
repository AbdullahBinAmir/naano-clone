"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/lib/actions/auth";

export default function SignInPage() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await signInAction({ email, password });
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Signed in");
    router.refresh();
    if (!result.role) {
      router.push("/onboarding");
    } else {
      router.push(result.role === "creator" ? "/dashboard/creator/overview" : "/dashboard/brand/overview");
    }
  }

  return (
    <GlassCard strong className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground-muted">Sign in to your Naano workspace.</p>
      </div>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <input
          required
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="primary" className="mt-2" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
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
