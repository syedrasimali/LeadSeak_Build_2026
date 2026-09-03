"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { searchProspects, ExaApiError } from "@/services/exa";
import { DISCOVERY_LEAD_LIMIT, DISCOVERY_WINDOW_MS } from "@/services/discovery-usage";
import type { Campaign } from "@/types/db";

export type DiscoveryStatus =
  | "idle"
  | "preparing"
  | "discovering"
  | "processing"
  | "saving"
  | "completed"
  | "error";

export interface DiscoveryResult {
  status: DiscoveryStatus;
  message: string;
  leadsFound: number;
  leadsSaved: number;
  duplicatesSkipped: number;
}

function normalizeForDedup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function extractDomainFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host || null;
  } catch {
    return null;
  }
}

export async function discoverProspectsAction(
  campaignId: string
): Promise<DiscoveryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Not signed in.",
      leadsFound: 0,
      leadsSaved: 0,
      duplicatesSkipped: 0,
    };
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("user_id", user.id)
    .single();

  if (campaignError || !campaign) {
    return {
      status: "error",
      message: "Campaign not found.",
      leadsFound: 0,
      leadsSaved: 0,
      duplicatesSkipped: 0,
    };
  }

  const hasCriteria =
    campaign.industry ||
    campaign.location ||
    campaign.keywords ||
    campaign.target_description;

  if (!hasCriteria) {
    return {
      status: "error",
      message:
        "Campaign must have at least one criteria: industry, location, keywords, or target description.",
      leadsFound: 0,
      leadsSaved: 0,
      duplicatesSkipped: 0,
    };
  }

  const windowStart = new Date(Date.now() - DISCOVERY_WINDOW_MS).toISOString();

  const { count: leadsInWindow } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", windowStart);

  if ((leadsInWindow ?? 0) >= DISCOVERY_LEAD_LIMIT) {
    const { data: oldest } = await supabase
      .from("leads")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let resetMsg = "You can generate more leads after the 24-hour window resets.";
    if (oldest) {
      const resetAt = new Date(
        new Date(oldest.created_at).getTime() + DISCOVERY_WINDOW_MS
      );
      resetMsg = `Limit resets at ${resetAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`;
    }

    return {
      status: "error",
      message: `You've used all ${DISCOVERY_LEAD_LIMIT} discovery credits for this 24-hour period. ${resetMsg}`,
      leadsFound: 0,
      leadsSaved: 0,
      duplicatesSkipped: 0,
    };
  }

  try {
    const leads = await searchProspects(campaign as Campaign, 10);

    if (leads.length === 0) {
      return {
        status: "completed",
        message: "No prospects found matching your criteria.",
        leadsFound: 0,
        leadsSaved: 0,
        duplicatesSkipped: 0,
      };
    }

    const { data: existingLeads } = await supabase
      .from("leads")
      .select("website, company_name")
      .eq("user_id", user.id);

    const existingDomains = new Set<string>();
    const existingCompanies = new Set<string>();

    for (const existing of existingLeads ?? []) {
      const domain = extractDomainFromUrl(existing.website);
      if (domain) existingDomains.add(domain);

      const normalized = normalizeForDedup(existing.company_name);
      if (normalized.length > 3) existingCompanies.add(normalized);
    }

    const newLeads: typeof leads = [];
    const seenDomains = new Set<string>();
    const seenCompanies = new Set<string>();
    let duplicatesSkipped = 0;

    for (const lead of leads) {
      const domain = lead.domain ?? extractDomainFromUrl(lead.website);

      if (domain) {
        if (existingDomains.has(domain) || seenDomains.has(domain)) {
          duplicatesSkipped++;
          continue;
        }
        seenDomains.add(domain);
      }

      const normalizedCompany = normalizeForDedup(lead.company_name);
      if (normalizedCompany.length > 3) {
        if (
          existingCompanies.has(normalizedCompany) ||
          seenCompanies.has(normalizedCompany)
        ) {
          duplicatesSkipped++;
          continue;
        }
        seenCompanies.add(normalizedCompany);
      }

      newLeads.push(lead);
    }

    if (newLeads.length === 0) {
      return {
        status: "completed",
        message: `Found ${leads.length} prospects but all ${duplicatesSkipped} were duplicates of existing leads.`,
        leadsFound: leads.length,
        leadsSaved: 0,
        duplicatesSkipped,
      };
    }

    const leadsToInsert = newLeads.map((lead) => ({
      user_id: user.id,
      campaign_id: campaignId,
      company_name: lead.company_name,
      contact_name: lead.contact_name,
      job_title: lead.job_title,
      industry: lead.industry,
      location: lead.location,
      website: lead.website,
      email: lead.email,
      phone: lead.phone,
      linkedin_url: lead.linkedin_url,
      google_maps_url: lead.google_maps_url,
      description: lead.description,
      source: lead.source,
      score: lead.score,
      temperature: lead.temperature,
      status: "new" as const,
    }));

    const { data: insertedLeads, error: insertError } = await supabase
      .from("leads")
      .insert(leadsToInsert)
      .select("id");

    if (insertError) {
      return {
        status: "error",
        message: `Found ${newLeads.length} new prospects but failed to save: ${insertError.message}`,
        leadsFound: leads.length,
        leadsSaved: 0,
        duplicatesSkipped,
      };
    }

    if (insertedLeads && insertedLeads.length > 0) {
      const scoreRecords = insertedLeads.map((inserted, index) => ({
        lead_id: inserted.id,
        score: newLeads[index].score,
        temperature: newLeads[index].temperature,
        reason: newLeads[index].reason,
      }));

      const { error: scoreError } = await supabase
        .from("lead_scores")
        .insert(scoreRecords);
      if (scoreError) {
        console.error("Failed to save lead scores:", scoreError.message);
      }
    }

    await supabase.from("lead_searches").insert({
      user_id: user.id,
      campaign_id: campaignId,
      query: campaign.industry || campaign.keywords || campaign.target_description || campaign.location || "",
      status: "completed" as const,
      result_count: newLeads.length,
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard");

    const parts = [`Saved ${newLeads.length} new prospects.`];
    if (duplicatesSkipped > 0) {
      parts.push(`Skipped ${duplicatesSkipped} duplicates.`);
    }

    return {
      status: "completed",
      message: parts.join(" "),
      leadsFound: leads.length,
      leadsSaved: newLeads.length,
      duplicatesSkipped,
    };
  } catch (error) {
    if (error instanceof ExaApiError) {
      let message = "Discovery failed.";

      if (error.code === "AUTH_ERROR") {
        message = "API configuration error. Please contact support.";
      } else if (error.code === "RATE_LIMIT") {
        message = "Rate limit exceeded. Please try again later.";
      } else if (error.code === "TIMEOUT") {
        message = "Request timed out. Please try again.";
      } else if (error.code === "INVALID_INPUT") {
        message = error.message;
      } else if (error.code === "INVALID_RESPONSE") {
        message = "Invalid response from discovery service.";
      } else if (error.code === "SERVICE_ERROR") {
        message =
          "Discovery service is currently unavailable. Please try again later.";
      } else if (error.code === "NETWORK_ERROR") {
        message = "Network error. Please check your connection and try again.";
      }

      return {
        status: "error",
        message,
        leadsFound: 0,
        leadsSaved: 0,
        duplicatesSkipped: 0,
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred.",
      leadsFound: 0,
      leadsSaved: 0,
      duplicatesSkipped: 0,
    };
  }
}
