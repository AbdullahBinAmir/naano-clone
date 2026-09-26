"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ImageUpload } from "@/components/ui/image-upload";
import { updateCreatorSettingsAction } from "@/lib/actions/settings";

export function CreatorSettingsForm({
  userId,
  avatarUrl,
  displayName,
  linkedinPublicUrl,
}: {
  userId: string;
  avatarUrl: string;
  displayName: string;
  linkedinPublicUrl: string;
}) {
  const [pending, setPending] = React.useState(false);
  const [name, setName] = React.useState(displayName);
  const [linkedin, setLinkedin] = React.useState(linkedinPublicUrl);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const result = await updateCreatorSettingsAction({ displayName: name, linkedinPublicUrl: linkedin });
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
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <form className="flex max-w-md flex-col gap-5" onSubmit={onSubmit} noValidate>
        <ImageUpload kind="avatar" userId={userId} value={avatarUrl} name={name} label="Profile photo" />
        <TextField
          label="Display name"
          name="displayName"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.displayName}
        />
        <TextField
          label="LinkedIn profile URL"
          name="linkedinPublicUrl"
          type="url"
          autoComplete="url"
          placeholder="https://linkedin.com/in/your-name"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          error={errors.linkedinPublicUrl}
        />
        <Button type="submit" variant="primary" className="self-start" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
