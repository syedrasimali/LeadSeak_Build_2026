import type { Metadata } from "next";
import {
  listLeads,
  countLeads,
  listCampaigns,
  listLeadIndustries,
  listLeadLocations,
  getLeadQualifications,
} from "@/services/leads";
import { LeadsPageClient } from "./client";
import { DemoDataNotice } from "@/components/dashboard/demo-data-notice";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/layout/page-header";
import { Flame, Snowflake, Sun, Users } from "lucide-react";
import { MotionGrid } from "@/components/dashboard/motion-grid";
import { ExportLeadsButton } from "@/components/dashboard/export-leads-button";
import { ScoringRulesButton } from "@/components/dashboard/scoring-rules-button";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let counts = { total: 0, hot: 0, warm: 0, cold: 0, byStatus: { new: 0, contacted: 0, replied: 0, qualified: 0, won: 0, lost: 0 } };
  let campaigns: Awaited<ReturnType<typeof listCampaigns>> = [];
  let industries: string[] = [];
  let locations: string[] = [];
  let qualifications: Record<string, { reason: string | null }> = {};
  let loadError: string | null = null;

  try {
    [leads, counts, campaigns, industries, locations] = await Promise.all([
      listLeads(),
      countLeads(),
      listCampaigns(),
      listLeadIndustries(),
      listLeadLocations(),
    ]);

    const leadIds = leads.map((l) => l.id);
    qualifications = await getLeadQualifications(leadIds);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load leads.";
  }

  const isEmpty = leads.length === 0;

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Leads"
        description="Qualified prospects scored against your campaign criteria and sorted by temperature."
        actions={
          <>
            <ExportLeadsButton leads={leads} />
            <ScoringRulesButton />
          </>
        }
      />

      {isEmpty && <DemoDataNotice />}

      {loadError && (
        <div className="mb-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-small text-danger">
          {loadError}
        </div>
      )}

      <MotionGrid className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Leads"
          value={counts.total.toLocaleString()}
          icon={<Users className="size-4" />}
          tone="electric"
        />
        <MetricCard
          label="Hot"
          value={counts.hot.toLocaleString()}
          icon={<Flame className="size-4" />}
          tone="danger"
        />
        <MetricCard
          label="Warm"
          value={counts.warm.toLocaleString()}
          icon={<Sun className="size-4" />}
          tone="warning"
        />
        <MetricCard
          label="Cold"
          value={counts.cold.toLocaleString()}
          icon={<Snowflake className="size-4" />}
          tone="electric"
        />
      </MotionGrid>

      <div data-reveal-load style={{ animationDelay: "0.3s" }}>
        <LeadsPageClient
          leads={leads}
          campaigns={campaigns}
          industries={industries}
          locations={locations}
          qualifications={qualifications}
        />
      </div>
    </>
  );
}
