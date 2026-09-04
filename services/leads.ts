import { createClient } from "@/lib/supabase/server";
import type {
  Lead,
  LeadInsert,
  LeadUpdate,
  LeadStatus,
  Temperature,
} from "@/types/db";

export interface LeadListFilters {
  search?: string;
  status?: LeadStatus | "all";
  temperature?: Temperature | "all";
  campaignId?: string | "all";
  industry?: string;
  location?: string;
  sortBy?: "score" | "recent" | "name" | "company";
  sortDir?: "asc" | "desc";
}

export async function listLeads(
  filters: LeadListFilters = {}
): Promise<Lead[]> {
  const supabase = await createClient();

  let query = supabase.from("leads").select("*");

  if (filters.campaignId && filters.campaignId !== "all") {
    query = query.eq("campaign_id", filters.campaignId);
  }
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.temperature && filters.temperature !== "all") {
    query = query.eq("temperature", filters.temperature);
  }
  if (filters.industry && filters.industry.trim()) {
    query = query.ilike("industry", `%${filters.industry.trim()}%`);
  }
  if (filters.location && filters.location.trim()) {
    query = query.ilike("location", `%${filters.location.trim()}%`);
  }
  if (filters.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    query = query.or(
      `company_name.ilike.${q},contact_name.ilike.${q},email.ilike.${q},job_title.ilike.${q},industry.ilike.${q}`
    );
  }

  const sortCol =
    filters.sortBy === "name"
      ? "contact_name"
      : filters.sortBy === "company"
        ? "company_name"
        : filters.sortBy === "recent"
          ? "created_at"
          : "score";
  const ascending = filters.sortDir === "asc";
  query = query.order(sortCol, { ascending, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function countLeads(): Promise<{
  total: number;
  hot: number;
  warm: number;
  cold: number;
  byStatus: Record<LeadStatus, number>;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, temperature, status");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return {
    total: rows.length,
    hot: rows.filter((r) => r.temperature === "hot").length,
    warm: rows.filter((r) => r.temperature === "warm").length,
    cold: rows.filter((r) => r.temperature === "cold").length,
    byStatus: {
      new: rows.filter((r) => r.status === "new").length,
      contacted: rows.filter((r) => r.status === "contacted").length,
      replied: rows.filter((r) => r.status === "replied").length,
      qualified: rows.filter((r) => r.status === "qualified").length,
      won: rows.filter((r) => r.status === "won").length,
      lost: rows.filter((r) => r.status === "lost").length,
    },
  };
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createLead(
  input: LeadInsert
): Promise<{ data: Lead | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...input, user_id: user.id })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateLead(
  id: string,
  updates: LeadUpdate
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error: ownershipError } = await supabase
    .from("leads")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (ownershipError) return { error: "Lead not found." };

  const { error } = await supabase
    .from("leads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteLead(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error: ownershipError } = await supabase
    .from("leads")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (ownershipError) return { error: "Lead not found." };

  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getLeadQualification(
  leadId: string
): Promise<{ reason: string | null; score: number | null; temperature: Temperature | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_scores")
    .select("reason, score, temperature")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { reason: null, score: null, temperature: null };
  return data ?? { reason: null, score: null, temperature: null };
}

export async function getLeadQualifications(
  leadIds: string[]
): Promise<Record<string, { reason: string | null }>> {
  if (leadIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_scores")
    .select("lead_id, reason")
    .in("lead_id", leadIds)
    .order("created_at", { ascending: false });
  if (error) return {};

  const result: Record<string, { reason: string | null }> = {};
  for (const row of data ?? []) {
    if (!result[row.lead_id]) {
      result[row.lead_id] = { reason: row.reason };
    }
  }
  return result;
}

export async function listCampaigns(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listLeadIndustries(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("industry")
    .not("industry", "is", null);
  if (error) return [];
  const industries = new Set<string>();
  for (const row of data ?? []) {
    if (row.industry) industries.add(row.industry);
  }
  return Array.from(industries).sort();
}

export async function listLeadLocations(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("location")
    .not("location", "is", null);
  if (error) return [];
  const locations = new Set<string>();
  for (const row of data ?? []) {
    if (row.location) locations.add(row.location);
  }
  return Array.from(locations).sort();
}
