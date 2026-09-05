import type { Metadata } from "next";
import {
  BarChart3,
  Flame,
  Snowflake,
  Sun,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MotionGrid } from "@/components/dashboard/motion-grid";
import { AreaChart } from "@/components/dashboard/charts/area-chart";
import { DonutChart } from "@/components/dashboard/charts/donut-chart";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CampaignPerformance } from "@/components/dashboard/campaign-performance";
import { IcpBuilderPanel } from "@/components/dashboard/icp-builder-panel";
import { DateRangeSelector, ExportButton } from "@/components/dashboard/analytics-actions";
import type { ExportData } from "@/components/dashboard/analytics-actions";
import {
  getAnalyticsMetrics,
  getCampaignStats,
  getIndustryBreakdown,
  getLeadGrowthSeries,
  getLeadStatusBreakdown,
  getLocationBreakdown,
  getTemperatureDistribution,
} from "@/services/analytics";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const statusColors = [
  "var(--color-electric-400)",
  "var(--color-indigo-blue-400)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-content-muted)",
];

const industryColors = [
  "var(--color-electric-400)",
  "var(--color-indigo-blue-400)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
];

function parseRange(raw: string | string[] | undefined): number {
  const val = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(val ?? "12", 10);
  if (isNaN(n) || n < 0) return 12;
  return n;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const rangeMonths = parseRange(resolved.range);
  const rangeLabel =
    rangeMonths === 0
      ? "All time"
      : rangeMonths <= 30
        ? `${rangeMonths} days`
        : `${rangeMonths} months`;

  let metrics = { total: 0, hot: 0, warm: 0, cold: 0, activeCampaigns: 0 };
  let growth: { label: string; count: number }[] = [];
  let temperature = { hot: 0, warm: 0, cold: 0 };
  let statusBreakdown: Record<string, number> = {};
  let industries: { label: string; value: number }[] = [];
  let locations: { label: string; value: number }[] = [];
  let campaignStats: Awaited<ReturnType<typeof getCampaignStats>> = [];
  let loadError: string | null = null;

  try {
    [metrics, growth, temperature, statusBreakdown, industries, locations, campaignStats] =
      await Promise.all([
        getAnalyticsMetrics(),
        getLeadGrowthSeries(rangeMonths),
        getTemperatureDistribution(),
        getLeadStatusBreakdown(),
        getIndustryBreakdown(),
        getLocationBreakdown(),
        getCampaignStats(),
      ]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load analytics.";
  }

  const hasData = metrics.total > 0;

  const exportData: ExportData = {
    metrics,
    growth,
    temperature,
    statusBreakdown,
    industries,
    locations,
  };

  if (!hasData) {
    return (
      <>
        <PageHeader
          eyebrow="Reporting"
          title="Analytics"
          description="Which criteria produce revenue, and where prospects fall out of the funnel."
          actions={
            <>
              <DateRangeSelector defaultValue={String(rangeMonths)} />
              <ExportButton data={exportData} />
            </>
          }
        />

        <EmptyState
          icon={<BarChart3 />}
          title="No leads yet"
          description="Run a discovery on one of your campaigns to surface prospects. Analytics will appear here once leads are generated."
          className="mt-8"
        />
      </>
    );
  }

  const growthSeries = growth.map((p) => p.count);
  const growthLabels = growth.map((p) => p.label);

  const temperatureTotal = temperature.hot + temperature.warm + temperature.cold;
  const temperatureSegments = [
    { label: "Hot", value: temperature.hot, color: "var(--color-danger)" },
    { label: "Warm", value: temperature.warm, color: "var(--color-warning)" },
    { label: "Cold", value: temperature.cold, color: "var(--color-electric-400)" },
  ];

  const statusEntries = Object.entries(statusBreakdown) as [string, number][];
  const statusTotal = statusEntries.reduce((sum, [, v]) => sum + v, 0);
  const statusSegments = statusEntries.map(([label, value], i) => ({
    label,
    value,
    color: statusColors[i % statusColors.length],
  }));

  const industryTotal = industries.reduce((sum, i) => sum + i.value, 0);
  const locationTotal = locations.reduce((sum, l) => sum + l.value, 0);

  return (
    <>
      <PageHeader
        eyebrow="Reporting"
        title="Analytics"
        description="Which criteria produce revenue, and where prospects fall out of the funnel."
        actions={
          <>
            <DateRangeSelector defaultValue={String(rangeMonths)} />
            <ExportButton data={exportData} />
          </>
        }
      />

      {/* Metric cards */}
      <MotionGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Leads"
          value={metrics.total.toLocaleString()}
          icon={<Users className="size-4" />}
          tone="electric"
        />
        <MetricCard
          label="Hot Leads"
          value={metrics.hot.toLocaleString()}
          icon={<Flame className="size-4" />}
          tone="danger"
        />
        <MetricCard
          label="Warm Leads"
          value={metrics.warm.toLocaleString()}
          icon={<Sun className="size-4" />}
          tone="warning"
        />
        <MetricCard
          label="Cold Leads"
          value={metrics.cold.toLocaleString()}
          icon={<Snowflake className="size-4" />}
          tone="electric"
        />
      </MotionGrid>

      {/* Lead growth + temperature distribution */}
      <div data-reveal-load className="mt-5 grid gap-5 xl:grid-cols-2" style={{ animationDelay: "0.3s" }}>
        <div className="flex flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate text-body font-semibold text-content">
                Lead growth
              </h2>
              <p className="mt-0.5 truncate text-caption text-content-muted">
                Leads discovered per month
              </p>
            </div>
            <Badge variant="electric" dot>
              {rangeLabel}
            </Badge>
          </div>
          <div className="flex flex-1 flex-col justify-end p-5">
            <AreaChart
              gradientId="analytics-growth"
              data={growthSeries}
              labels={growthLabels}
              className="h-48"
            />
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate text-body font-semibold text-content">
                Temperature distribution
              </h2>
              <p className="mt-0.5 truncate text-caption text-content-muted">
                How leads are classified by score
              </p>
            </div>
            <Badge variant="warning" dot>
              Live
            </Badge>
          </div>
          <div className="flex flex-1 flex-col items-center gap-5 p-5">
            <DonutChart
              className="size-36"
              segments={temperatureSegments}
              centerValue={temperatureTotal.toLocaleString()}
              centerLabel="leads"
            />

            <div className="flex w-full flex-col gap-2.5">
              {temperatureSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="flex-1 truncate text-small text-content">
                    {seg.label}
                  </span>
                  <span className="font-mono text-small text-content-secondary">
                    {seg.value}
                  </span>
                  <span className="w-9 text-right font-mono text-caption text-content-muted">
                    {temperatureTotal > 0
                      ? Math.round((seg.value / temperatureTotal) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lead status + top industries */}
      <div data-reveal-load className="mt-5 grid gap-5 xl:grid-cols-2" style={{ animationDelay: "0.45s" }}>
        <div className="flex flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate text-body font-semibold text-content">
                Lead status
              </h2>
              <p className="mt-0.5 truncate text-caption text-content-muted">
                Pipeline stage breakdown
              </p>
            </div>
            <Badge variant="indigo" dot>
              Pipeline
            </Badge>
          </div>
          <div className="flex flex-1 flex-col items-center gap-5 p-5">
            <DonutChart
              className="size-36"
              segments={statusSegments}
              centerValue={statusTotal.toLocaleString()}
              centerLabel="leads"
            />

            <div className="flex w-full flex-col gap-2.5">
              {statusEntries.map(([label, value], i) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: statusColors[i % statusColors.length],
                    }}
                  />
                  <span className="flex-1 truncate text-small text-content capitalize">
                    {label}
                  </span>
                  <span className="font-mono text-small text-content-secondary">
                    {value}
                  </span>
                  <span className="w-9 text-right font-mono text-caption text-content-muted">
                    {statusTotal > 0
                      ? Math.round((value / statusTotal) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-body font-semibold text-content">
              Top industries
            </h2>
            <p className="mt-0.5 text-caption text-content-muted">
              Where discovery is landing
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-5 p-5">
            {industries.length > 0 ? (
              <>
                <DonutChart
                  className="size-36"
                  segments={industries.map((item, i) => ({
                    label: item.label,
                    value: item.value,
                    color: industryColors[i % industryColors.length],
                  }))}
                  centerValue={industryTotal.toLocaleString()}
                  centerLabel="leads"
                />

                <div className="flex w-full flex-col gap-2.5">
                  {industries.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            industryColors[i % industryColors.length],
                        }}
                      />
                      <span className="flex-1 truncate text-small text-content">
                        {item.label}
                      </span>
                      <span className="font-mono text-small text-content-secondary">
                        {item.value}
                      </span>
                      <span className="w-9 text-right font-mono text-caption text-content-muted">
                        {industryTotal > 0
                          ? Math.round((item.value / industryTotal) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-8 text-caption text-content-muted">
                No industry data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top locations */}
      <div data-reveal-load className="mt-5" style={{ animationDelay: "0.6s" }}>
        <div className="rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-body font-semibold text-content">
              Top locations
            </h2>
            <p className="mt-0.5 text-caption text-content-muted">
              Geographic distribution of leads
            </p>
          </div>
          <div className="p-5">
            {locations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {locations.map((loc, i) => {
                  const pct =
                    locationTotal > 0
                      ? Math.round((loc.value / locationTotal) * 100)
                      : 0;
                  return (
                    <div key={loc.label} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-small font-medium text-content">
                          {loc.label}
                        </span>
                        <span className="flex items-baseline gap-2">
                          <span className="font-mono text-caption text-content-secondary">
                            {loc.value.toLocaleString()}
                          </span>
                          <span className="w-10 text-right font-mono text-caption text-content-muted">
                            {pct}%
                          </span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-electric-500 to-indigo-blue-500 transition-all duration-500 ease-premium"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-caption text-content-muted">
                No location data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Campaign performance */}
      <div data-reveal-load className="mt-5" style={{ animationDelay: "0.75s" }}>
        <CampaignPerformance campaigns={campaignStats} />
      </div>

      {/* AI ICP Builder */}
      <div data-reveal-load className="mt-5" style={{ animationDelay: "0.9s" }}>
        <IcpBuilderPanel />
      </div>
    </>
  );
}
