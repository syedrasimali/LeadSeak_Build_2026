"use server";

import { revalidatePath } from "next/cache";
import { updateProfile, uploadAvatar, removeAvatar, updateSettings, deleteAccount } from "@/services/profiles";
import type { WorkspaceSettings } from "@/types/db";

export async function updateProfileAction(
  formData: FormData
): Promise<{ error: string | null }> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const { error } = await updateProfile({ name });
  if (error) return { error };

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<{ error: string | null }> {
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) return { error: "File must be under 5 MB." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return { error: "Only JPG, PNG, WebP, or GIF files are allowed." };
  }

  const { error } = await uploadAvatar(file);
  if (error) return { error };

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function removeAvatarAction(): Promise<{ error: string | null }> {
  const { error } = await removeAvatar();
  if (error) return { error };

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateSettingsAction(
  settings: WorkspaceSettings
): Promise<{ error: string | null }> {
  const { error } = await updateSettings(settings);
  if (error) return { error };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteAccountAction(): Promise<{ error: string | null; redirect: boolean }> {
  const { error } = await deleteAccount();
  if (error) return { error, redirect: false };

  return { error: null, redirect: true };
}
