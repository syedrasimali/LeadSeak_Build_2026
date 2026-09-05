import { countCampaigns, listCampaigns } from "@/services/campaigns";
import { countLeads, listLeads } from "@/services/leads";
import { listActivities } from "@/services/activities";
import { getLeadGrowthSeries } from "@/services/analytics";
import { RecentCampaignsDb, RecentLeadsDb } from "@/components/dashboard/recent-db";
import { LeadDistributionDb } from "@/components/dashboard/lead-distribution-db";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MotionGrid } from "@/components/dashboard/motion-grid";
import { DemoDataNotice } from "@/components/dashboard/demo-data-notice";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardAiInsights } from "@/components/dashboard/dashboard-ai-insights";
import { AreaChart } from "@/components/dashboard/charts/area-chart";
import { Badge } from "@/components/ui/badge";
import { NewCampaignButton } from "@/components/dashboard/new-campaign-button";
import { ExportLeadsButton } from "@/components/dashboard/export-leads-button";
import { Flame, Snowflake, Sun, Target, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Overview" };

/* Overview is dynamic — it reads real counts from the database on every
   request so the numbers stay current as data is added. */
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  let campaignCounts = { draft: 0, active: 0, paused: 0, completed: 0 };
  let leadCounts = { total: 0, hot: 0, warm: 0, cold: 0, byStatus: { new: 0, contacted: 0, replied: 0, qualified: 0, won: 0, lost: 0 } };
  let campaigns: Awaited<ReturnType<typeof listCampaigns>> = [];
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let activities: Awaited<ReturnType<typeof listActivities>> = [];
  let growthSeries: Awaited<ReturnType<typeof getLeadGrowthSeries>> = [];
  let loadError: string | null = null;

  try {
    [campaignCounts, leadCounts, campaigns, leads, activities, growthSeries] = await Promise.all([
      countCampaigns(),
      countLeads(),
      listCampaigns(),
      listLeads({ sortBy: "recent", sortDir: "desc" }),
      listActivities(),
      getLeadGrowthSeries(),
    ]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load dashboard data.";
  }

  const isEmpty = campaigns.length === 0 && leadCounts.total === 0;

  const activeCount =
    campaignCounts.active +
    campaignCounts.paused +
    campaignCounts.draft +
    campaignCounts.completed;

  const chartData = growthSeries.length > 0
    ? growthSeries.map((p) => p.count)
    : Array.from({ length: 12 }, () => 0);
  const chartLabels = growthSeries.length > 0
    ? growthSeries.map((p) => p.label)
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="Discovery volume, pipeline temperature, and campaign performance at a glance."
        actions={
          <>
            <ExportLeadsButton leads={leads} />
            <NewCampaignButton className="shimmer-btn" />
          </>
        }
      />

      {isEmpty && <DemoDataNotice />}

      {loadError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-small text-danger">
          {loadError}
        </div>
      )}

      <MotionGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Leads"
          value={leadCounts.total.toLocaleString()}
          icon={<Users className="size-4" />}
          tone="electric"
        />
        <MetricCard
          label="Hot Leads"
          value={leadCounts.hot.toLocaleString()}
          icon={<Flame className="size-4" />}
          tone="danger"
        />
        <MetricCard
          label="Warm Leads"
          value={leadCounts.warm.toLocaleString()}
          icon={<Sun className="size-4" />}
          tone="warning"
        />
        <MetricCard
          label="Cold Leads"
          value={leadCounts.cold.toLocaleString()}
          icon={<Snowflake className="size-4" />}
          tone="electric"
        />
        <MetricCard
          label="Active Campaigns"
          value={String(activeCount)}
          icon={<Target className="size-4" />}
          tone="success"
        />
      </MotionGrid>

      <div data-reveal-load className="mt-5" style={{ animationDelay: "0.2s" }}>
        <DashboardAiInsights leads={leads} leadCounts={leadCounts} />
      </div>

      <div data-reveal-load className="mt-5 grid gap-5 xl:grid-cols-3" style={{ animationDelay: "0.3s" }}>
        <div className="flex flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)] xl:col-span-2">
          <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-body font-semibold text-content">
                Discovery volume
              </h2>
              <p className="mt-0.5 text-caption text-content-muted">
                {isEmpty
                  ? "Demo data — real data will appear once leads are added"
                  : "Leads in the database, last 12 months"}
              </p>
            </div>
            <Badge variant="electric" dot>
              Last 12 months
            </Badge>
          </div>

          <div className="flex flex-1 flex-col justify-end p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-h2 leading-none text-content">
                {leadCounts.total.toLocaleString()}
              </span>
            </div>
            <AreaChart
              gradientId="overview-discovery"
              data={chartData}
              labels={chartLabels}
              className="mt-6 h-44"
            />
          </div>
        </div>

        <LeadDistributionDb counts={leadCounts} />
      </div>

      <div data-reveal-load className="mt-5 grid gap-5 xl:grid-cols-2" style={{ animationDelay: "0.45s" }}>
        <RecentCampaignsDb campaigns={campaigns} />
        <RecentLeadsDb leads={leads} />
      </div>

      <div data-reveal-load className="mt-5" style={{ animationDelay: "0.6s" }}>
        <ActivityFeed activities={activities} />
      </div>
    </>
  );
}
