"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/lib/actions/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [checkEmail, setCheckEmail] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await signUpAction({ fullName, email, password });
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setCheckEmail(true);
      return;
    }
    toast.success("Account created");
    router.push("/onboarding");
  }

  if (checkEmail) {
    return (
      <GlassCard strong className="flex flex-col gap-3 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-foreground-muted">
          We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it, then come back
          and sign in.
        </p>
        <Link href="/sign-in" className="mt-2 text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard strong className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-foreground-muted">Start as a creator or a brand — you can switch later.</p>
      </div>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <input
          required
          placeholder="Full name"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
          placeholder="Password (min 8 characters)"
          className="input"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="primary" className="mt-2" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
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
