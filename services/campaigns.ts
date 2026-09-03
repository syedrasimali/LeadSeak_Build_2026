import { createClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignInsert,
  CampaignUpdate,
  CampaignStatus,
} from "@/types/db";

export async function listCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listCampaignsByStatus(
  status: CampaignStatus | "all"
): Promise<Campaign[]> {
  const supabase = await createClient();
  let query = supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function countCampaigns(): Promise<
  Record<CampaignStatus, number>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, status");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return {
    draft: rows.filter((r) => r.status === "draft").length,
    active: rows.filter((r) => r.status === "active").length,
    paused: rows.filter((r) => r.status === "paused").length,
    completed: rows.filter((r) => r.status === "completed").length,
  };
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createCampaign(
  input: CampaignInsert
): Promise<{ data: Campaign | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...input, user_id: user.id })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateCampaign(
  id: string,
  updates: CampaignUpdate
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error: ownershipError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (ownershipError) return { error: "Campaign not found." };

  const { error } = await supabase
    .from("campaigns")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteCampaign(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error: ownershipError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (ownershipError) return { error: "Campaign not found." };

  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
