"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { updatePasswordAction } from "@/lib/actions/auth";

export function PasswordForm() {
  const [pending, setPending] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const result = await updatePasswordAction({ password, confirmPassword });
    setPending(false);
    if (result.error) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) setErrors(result.fieldErrors);
      else toast.error(result.error);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <form className="flex max-w-md flex-col gap-4" onSubmit={onSubmit} noValidate>
        <TextField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        <Button type="submit" variant="primary" className="self-start" disabled={pending || !password}>
          {pending ? "Saving…" : "Update password"}
        </Button>
      </form>
    </Card>
  );
}
