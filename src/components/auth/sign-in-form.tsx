"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { signInAction } from "@/lib/actions/auth";

export function SignInForm({ next, notice }: { next: string | null; notice: string | null }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    const result = await signInAction({ email, password });
    setPending(false);

    if (result.error) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) setErrors(result.fieldErrors);
      else setFormError(result.error);
      return;
    }
    toast.success("Signed in");
    router.refresh();
    if (!result.role) router.push("/onboarding");
    else router.push(next ?? (result.role === "creator" ? "/dashboard/creator/overview" : "/dashboard/brand/overview"));
  }

  return (
    <Card tone="raised" className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground-muted">Sign in to your Naano workspace.</p>
      </div>
      {notice === "link_expired" ? (
        <p role="alert" className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
          That email link is invalid or has expired. Sign in, or request a new link.
        </p>
      ) : null}
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="-mt-1 text-right">
          <Link href="/forgot-password" className="text-sm text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        {formError ? (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-center text-sm text-foreground-muted">
        New to Naano?{" "}
        <Link href="/sign-up" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
