"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { setProfileImageAction, type ImageKind } from "@/lib/actions/images";
import { PROFILE_IMAGES_BUCKET } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

/** Downscales in the browser so uploads stay small (the bucket itself caps files at 2 MB). */
async function resizeToJpeg(file: File, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't process that image."))), "image/jpeg", 0.85),
  );
}

const publicPathOf = (url: string) => url.split(`/object/public/${PROFILE_IMAGES_BUCKET}/`)[1];

export function ImageUpload({
  kind,
  userId,
  value,
  name,
  label,
  onChange,
}: {
  kind: ImageKind;
  userId: string;
  value: string;
  /** Used for the avatar fallback initials and alt text. */
  name: string;
  label: string;
  onChange?: (url: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [url, setUrl] = React.useState(value);
  const banner = kind === "banner";

  async function removePrevious(previous: string) {
    const path = previous ? publicPathOf(previous) : undefined;
    if (path?.startsWith(`${userId}/`)) await createClient().storage.from(PROFILE_IMAGES_BUCKET).remove([path]);
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) return void toast.error("Use a JPG, PNG or WebP image.");
    if (file.size > MAX_INPUT_BYTES) return void toast.error("That image is too large (max 8 MB).");

    setBusy(true);
    try {
      const blob = await resizeToJpeg(file, banner ? 1600 : 640);
      const path = `${userId}/${kind}-${Date.now()}.jpg`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(PROFILE_IMAGES_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (uploadError) {
        throw new Error(
          /bucket not found/i.test(uploadError.message)
            ? "Image storage isn't set up yet — apply migration 0017 in Supabase."
            : uploadError.message,
        );
      }

      const { data } = supabase.storage.from(PROFILE_IMAGES_BUCKET).getPublicUrl(path);
      const result = await setProfileImageAction({ kind, url: data.publicUrl });
      if (result.error) throw new Error(result.error);

      const previous = url;
      setUrl(data.publicUrl);
      onChange?.(data.publicUrl);
      void removePrevious(previous);
      toast.success("Image updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    const result = await setProfileImageAction({ kind, url: null });
    if (result.error) {
      setBusy(false);
      return void toast.error(result.error);
    }
    const previous = url;
    setUrl("");
    onChange?.("");
    void removePrevious(previous);
    setBusy(false);
    toast.success("Image removed");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className={cn("flex gap-4", banner ? "flex-col" : "items-center")}>
        {banner ? (
          <div
            className="h-28 w-full overflow-hidden rounded-md border border-border bg-cover bg-center"
            style={{ backgroundImage: url ? `url(${url})` : "linear-gradient(135deg, rgba(155,92,246,.25), #1C1C1F)" }}
            role="img"
            aria-label={url ? `${label} preview` : `No ${label.toLowerCase()} yet`}
          />
        ) : (
          <Avatar src={url || null} alt={name} fallback={initials(name)} size="lg" className="h-20 w-20 text-xl" />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={onPick} aria-label={`Upload ${label.toLowerCase()}`} />
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.75} />
            {busy ? "Working…" : url ? "Replace" : "Upload"}
          </Button>
          {url && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Remove
            </Button>
          )}
          <span className="text-xs text-foreground-subtle">JPG, PNG or WebP</span>
        </div>
      </div>
    </div>
  );
}
