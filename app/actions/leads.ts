"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LeadInsert, LeadStatus, LeadUpdate } from "@/types/db";

export async function createLeadAction(
  input: LeadInsert
): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const FREE_PLAN_LEAD_LIMIT = 100;
  const { count: existingLeadCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((existingLeadCount ?? 0) >= FREE_PLAN_LEAD_LIMIT) {
    return { error: `You've reached the free plan limit of ${FREE_PLAN_LEAD_LIMIT} leads. Upgrade to add more.` };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...input, user_id: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { error: null, id: data?.id };
}

export async function updateLeadAction(
  id: string,
  updates: LeadUpdate
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("leads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function advanceLeadStageAction(
  id: string,
  status: LeadStatus
): Promise<{ error: string | null }> {
  return updateLeadAction(id, { status });
}

export async function deleteLeadAction(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { error: null };
}
