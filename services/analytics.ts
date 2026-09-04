import { createClient } from "@/lib/supabase/server";
import type { CampaignStatus, LeadStatus, Temperature } from "@/types/db";

export interface AnalyticsMetrics {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  activeCampaigns: number;
}

export interface CampaignStats {
  id: string;
  name: string;
  status: CampaignStatus;
  leads: number;
  hot: number;
  warm: number;
  cold: number;
  byStatus: Record<LeadStatus, number>;
}

export interface MonthlyPoint {
  month: string;
  label: string;
  count: number;
}

export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  const supabase = await createClient();

  const [{ data: leads }, { data: campaigns }] = await Promise.all([
    supabase.from("leads").select("id, temperature"),
    supabase.from("campaigns").select("id, status").eq("status", "active"),
  ]);

  const leadRows = leads ?? [];
  return {
    total: leadRows.length,
    hot: leadRows.filter((r) => r.temperature === "hot").length,
    warm: leadRows.filter((r) => r.temperature === "warm").length,
    cold: leadRows.filter((r) => r.temperature === "cold").length,
    activeCampaigns: campaigns?.length ?? 0,
  };
}

export async function getLeadGrowthSeries(months = 12): Promise<MonthlyPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return [];

  const now = new Date();
  let totalMonths = months;

  if (months <= 0) {
    const earliest = new Date(data[0].created_at);
    totalMonths =
      (now.getFullYear() - earliest.getFullYear()) * 12 +
      (now.getMonth() - earliest.getMonth()) + 1;
    if (totalMonths < 1) totalMonths = 1;
  }

  const points: MonthlyPoint[] = [];

  for (let i = totalMonths - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = date.toLocaleString("en-US", { month: "short" });
    const month = date.toISOString().slice(0, 7);

    const count = data.filter((row) => {
      const d = new Date(row.created_at);
      return d >= date && d < nextDate;
    }).length;

    points.push({ month, label, count });
  }

  return points;
}

export async function getTemperatureDistribution(): Promise<
  Record<Temperature, number>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, temperature");

  if (error || !data) return { hot: 0, warm: 0, cold: 0 };

  return {
    hot: data.filter((r) => r.temperature === "hot").length,
    warm: data.filter((r) => r.temperature === "warm").length,
    cold: data.filter((r) => r.temperature === "cold").length,
  };
}

export async function getLeadStatusBreakdown(): Promise<
  Record<LeadStatus, number>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, status");

  if (error || !data) {
    return { new: 0, contacted: 0, replied: 0, qualified: 0, won: 0, lost: 0 };
  }

  return {
    new: data.filter((r) => r.status === "new").length,
    contacted: data.filter((r) => r.status === "contacted").length,
    replied: data.filter((r) => r.status === "replied").length,
    qualified: data.filter((r) => r.status === "qualified").length,
    won: data.filter((r) => r.status === "won").length,
    lost: data.filter((r) => r.status === "lost").length,
  };
}

export async function getIndustryBreakdown(
  limit = 5
): Promise<{ label: string; value: number }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, industry");

  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const industry = row.industry?.trim() || "Unknown";
    counts.set(industry, (counts.get(industry) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function getLocationBreakdown(
  limit = 5
): Promise<{ label: string; value: number }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, location");

  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const location = row.location?.trim() || "Unknown";
    counts.set(location, (counts.get(location) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function getCampaignStats(): Promise<CampaignStats[]> {
  const supabase = await createClient();

  const { data: campaigns, error: cmpError } = await supabase
    .from("campaigns")
    .select("id, name, status")
    .order("created_at", { ascending: false });

  if (cmpError || !campaigns) return [];

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, campaign_id, temperature, status");

  if (leadsError || !leads) return [];

  return campaigns.map((cmp) => {
    const cmpLeads = leads.filter((l) => l.campaign_id === cmp.id);
    return {
      id: cmp.id,
      name: cmp.name,
      status: cmp.status,
      leads: cmpLeads.length,
      hot: cmpLeads.filter((l) => l.temperature === "hot").length,
      warm: cmpLeads.filter((l) => l.temperature === "warm").length,
      cold: cmpLeads.filter((l) => l.temperature === "cold").length,
      byStatus: {
        new: cmpLeads.filter((l) => l.status === "new").length,
        contacted: cmpLeads.filter((l) => l.status === "contacted").length,
        replied: cmpLeads.filter((l) => l.status === "replied").length,
        qualified: cmpLeads.filter((l) => l.status === "qualified").length,
        won: cmpLeads.filter((l) => l.status === "won").length,
        lost: cmpLeads.filter((l) => l.status === "lost").length,
      },
    };
  });
}
