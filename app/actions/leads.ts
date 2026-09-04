"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DISCOVERY_LEAD_LIMIT, DISCOVERY_WINDOW_MS } from "@/services/discovery-usage";
import { createActivity } from "@/services/activities";
import type { LeadInsert, LeadStatus, LeadUpdate } from "@/types/db";

export async function createLeadAction(
  input: LeadInsert
): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const windowStart = new Date(Date.now() - DISCOVERY_WINDOW_MS).toISOString();
  const { count: leadsInWindow } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", windowStart);

  if ((leadsInWindow ?? 0) >= DISCOVERY_LEAD_LIMIT) {
    return { error: `You've used all ${DISCOVERY_LEAD_LIMIT} discovery credits for this 24-hour period. Wait for the window to reset.` };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...input, user_id: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  await createActivity({
    kind: "lead",
    title: "New lead added",
    detail: input.company_name || input.contact_name || "Manual lead",
  });
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
  const result = await updateLeadAction(id, { status });
  if (result.error) return result;
  await createActivity({
    kind: "stage",
    title: `Lead moved to ${status}`,
    detail: `Stage advanced to ${status}`,
  });
  return { error: null };
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
