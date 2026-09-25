"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { resendConfirmationAction, signUpAction } from "@/lib/actions/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [checkEmail, setCheckEmail] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    const result = await signUpAction({ fullName, email, password });
    setPending(false);

    if (result.error) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) setErrors(result.fieldErrors);
      else setFormError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setCheckEmail(true);
      return;
    }
    toast.success("Account created");
    router.push("/onboarding");
  }

  async function resend() {
    setResending(true);
    const result = await resendConfirmationAction({ email });
    setResending(false);
    if (result.error) toast.error(result.error);
    else toast.success("Confirmation email sent");
  }

  if (checkEmail) {
    return (
      <Card tone="raised" className="flex flex-col gap-3 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-foreground-muted">
          We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it and you&apos;ll be
          signed in automatically.
        </p>
        <Button variant="outline" className="mt-2" onClick={resend} disabled={resending}>
          {resending ? "Sending…" : "Resend email"}
        </Button>
        <Link href="/sign-in" className="mt-1 text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card tone="raised" className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-foreground-muted">Start as a creator or a brand — you&apos;ll choose next.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        {formError ? (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
