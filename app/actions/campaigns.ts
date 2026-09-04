"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createActivity } from "@/services/activities";
import type { CampaignInsert, CampaignStatus } from "@/types/db";

export async function createCampaignAction(
  input: CampaignInsert
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("campaigns")
    .insert({ ...input, user_id: user.id });

  if (error) return { error: error.message };
  await createActivity({
    kind: "campaign",
    title: "Campaign created",
    detail: input.name || "New campaign",
  });
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateCampaignAction(
  id: string,
  input: Partial<CampaignInsert>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("campaigns")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateCampaignStatusAction(
  id: string,
  status: CampaignStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteCampaignAction(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  await createActivity({
    kind: "campaign",
    title: "Campaign deleted",
    detail: campaign?.name || "Campaign removed",
  });
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard");
  return { error: null };
}
