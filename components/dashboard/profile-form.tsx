"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/app/actions/profile";

interface ProfileFormProps {
  name: string;
  email: string | null;
}

export function ProfileForm({ name, email }: ProfileFormProps) {
  const [currentName, setCurrentName] = React.useState(name);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  const dirty = currentName.trim() !== name;

  React.useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dirty) return;

    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const { error } = await updateProfileAction(formData);

    if (error) {
      setError(error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="profile-name" required>
          <Input
            id="profile-name"
            name="name"
            required
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            disabled={saving}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="profile-email"
          hint="Sign-in email cannot be changed here."
        >
          <Input
            id="profile-email"
            type="email"
            value={email ?? ""}
            disabled
            readOnly
            className="opacity-60"
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!dirty || saving} loading={saving}>
          Save changes
        </Button>

        {saved && (
          <span className="inline-flex items-center gap-1.5 text-caption text-success-soft">
            <Check className="size-3.5" />
            Profile updated
          </span>
        )}

        {error && (
          <span role="alert" className="text-caption text-danger-soft">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
