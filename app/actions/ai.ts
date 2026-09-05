"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeLead, generateWhyThisLead, generateOutreach, generateFollowUp, analyzeWebsite, buildIcpProfile } from "@/services/ai";
import type { Lead } from "@/types/db";

export async function getLeadAnalysisAction(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !lead) return { data: null, error: "Lead not found." };

  const analysis = analyzeLead(lead as Lead);
  return { data: analysis, error: null };
}

export async function getWhyThisLeadAction(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !lead) return { data: null, error: "Lead not found." };

  const whyThisLead = generateWhyThisLead(lead as Lead);
  return { data: whyThisLead, error: null };
}

export async function generateOutreachAction(
  leadId: string,
  options: { tone: "professional" | "friendly" | "persuasive" | "short"; type: "cold_email" | "linkedin_message" | "follow_up" }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !lead) return { data: null, error: "Lead not found." };

  const outreach = generateOutreach(lead as Lead, options);
  return { data: outreach, error: null };
}

export async function generateFollowUpAction(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !lead) return { data: null, error: "Lead not found." };

  const followUp = generateFollowUp(lead as Lead, 5);
  return { data: followUp, error: null };
}

export async function getWebsiteAnalysisAction(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !lead) return { data: null, error: "Lead not found." };

  const analysis = analyzeWebsite(lead as Lead);
  return { data: analysis, error: null };
}

export async function getIcpProfileAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("score", { ascending: false });

  if (error) return { data: null, error: "Failed to load leads." };

  const profile = buildIcpProfile((leads || []) as Lead[]);
  return { data: profile, error: null };
}
