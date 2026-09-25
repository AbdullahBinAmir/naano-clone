"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { updateBrandSettingsAction } from "@/lib/actions/settings";

export function BrandSettingsForm({ companyName, industry }: { companyName: string; industry: string }) {
  const [pending, setPending] = React.useState(false);
  const [name, setName] = React.useState(companyName);
  const [ind, setInd] = React.useState(industry);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const result = await updateBrandSettingsAction({ companyName: name, industry: ind });
    setPending(false);
    if (result.error) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) setErrors(result.fieldErrors);
      else toast.error(result.error);
      return;
    }
    toast.success("Settings saved");
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Company</CardTitle>
      </CardHeader>
      <form className="flex max-w-md flex-col gap-4" onSubmit={onSubmit} noValidate>
        <TextField
          label="Company name"
          name="companyName"
          autoComplete="organization"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.companyName}
        />
        <TextField
          label="Industry"
          name="industry"
          placeholder="e.g. Sales engagement software"
          value={ind}
          onChange={(e) => setInd(e.target.value)}
          error={errors.industry}
        />
        <Button type="submit" variant="primary" className="self-start" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
