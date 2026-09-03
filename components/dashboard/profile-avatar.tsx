"use client";

import * as React from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadAvatarAction, removeAvatarAction } from "@/app/actions/profile";

interface ProfileAvatarProps {
  name: string;
  currentUrl: string | null;
}

export function ProfileAvatar({ name, currentUrl }: ProfileAvatarProps) {
  const [uploading, setUploading] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.set("avatar", file);

    const { error } = await uploadAvatarAction(formData);
    if (error) setError(error);
    setUploading(false);
  }

  async function handleRemove() {
    setRemoving(true);
    setError("");

    const { error } = await removeAvatarAction();
    if (error) setError(error);
    setRemoving(false);
  }

  const busy = uploading || removing;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <UserAvatar name={name} src={currentUrl ?? undefined} size="xl" />

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={busy}
        />

        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={currentUrl ? "Replace photo" : "Upload photo"}
          className="absolute -bottom-1 -right-1 rounded-full"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Camera className="size-3.5" />
          )}
        </Button>
      </div>

      {currentUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={busy}
          className="text-content-muted gap-1.5"
        >
          {removing ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Trash2 className="size-3" />
          )}
          Remove photo
        </Button>
      )}

      {error && (
        <p role="alert" className="text-caption text-danger-soft text-center">
          {error}
        </p>
      )}
    </div>
  );
}
