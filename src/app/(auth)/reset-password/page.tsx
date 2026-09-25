"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { updatePasswordAction } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    const result = await updatePasswordAction({ password, confirmPassword });
    setPending(false);

    if (result.error) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) setErrors(result.fieldErrors);
      else setFormError(result.error);
      return;
    }
    toast.success("Password updated");
    router.refresh();
    router.push(
      !result.role ? "/onboarding" : result.role === "creator" ? "/dashboard/creator/overview" : "/dashboard/brand/overview",
    );
  }

  return (
    <Card tone="raised" className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <p className="mt-1 text-sm text-foreground-muted">Use at least 8 characters.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <TextField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        {formError ? (
          <p role="alert" className="text-sm text-danger">
            {formError}{" "}
            <Link href="/forgot-password" className="text-accent hover:underline">
              Request a new link
            </Link>
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Update password"}
        </Button>
      </form>
    </Card>
  );
}
