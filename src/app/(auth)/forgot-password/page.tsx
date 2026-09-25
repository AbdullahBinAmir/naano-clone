"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { requestPasswordResetAction } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldError(undefined);
    const result = await requestPasswordResetAction({ email });
    setPending(false);
    if (result.error) {
      if (result.fieldErrors?.email) setFieldError(result.fieldErrors.email);
      else setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card tone="raised" className="flex flex-col gap-3 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-foreground-muted">
          If an account exists for <span className="text-foreground">{email}</span>, we&apos;ve sent a link to reset
          your password.
        </p>
        <Link href="/sign-in" className="mt-2 text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card tone="raised" className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-foreground-muted">Enter your email and we&apos;ll send you a reset link.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError}
        />
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="text-center text-sm text-foreground-muted">
        <Link href="/sign-in" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
