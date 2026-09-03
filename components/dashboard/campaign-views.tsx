import { MoreHorizontal, Target, TrendingUp, Users } from "lucide-react";
import { Sparkline } from "@/components/dashboard/charts/sparkline";
import { CampaignRowActions } from "@/components/dashboard/campaign-row-actions";
import { Badge } from "@/components/ui/badge";
import { demoCampaigns, type CampaignStatus, type DemoCampaign } from "@/lib/demo-data";

const statusVariant: Record<
  CampaignStatus,
  "success" | "warning" | "neutral" | "electric"
> = {
  active: "success",
  paused: "warning",
  draft: "neutral",
  completed: "electric",
};

function CampaignCard({ campaign }: { campaign: DemoCampaign }) {
  const qualifyRate = campaign.prospects
    ? Math.round((campaign.qualified / campaign.prospects) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-elevated transition-all duration-300 ease-premium hover:border-line-strong hover:bg-surface-hover">
      <div aria-hidden className="pointer-events-none absolute inset-0 surface-sheen" />

      <div className="relative flex items-start gap-3 p-5 pb-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-electric-500/24 bg-electric-500/10 text-electric-400">
          <Target className="size-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body font-semibold text-content">
            {campaign.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-caption text-content-muted">
            {campaign.criteria}
          </p>
        </div>

        <CampaignRowActions name={campaign.name} />
      </div>

      <div className="relative flex items-center gap-2 px-5 pb-4">
        <Badge variant={statusVariant[campaign.status]} size="sm" dot>
          {campaign.status}
        </Badge>
        <span className="font-mono text-[0.625rem] text-content-disabled">
          {campaign.createdAt}
        </span>
      </div>

      {/* Stats row */}
      <div className="relative grid grid-cols-3 gap-px border-y border-line bg-line">
        <div className="bg-surface-elevated px-4 py-3">
          <p className="text-[0.625rem] uppercase tracking-wide text-content-muted">
            Prospects
          </p>
          <p className="mt-0.5 font-mono text-small text-content">
            {campaign.prospects.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface-elevated px-4 py-3">
          <p className="text-[0.625rem] uppercase tracking-wide text-content-muted">
            Qualified
          </p>
          <p className="mt-0.5 font-mono text-small text-content">
            {campaign.qualified}
          </p>
        </div>
        <div className="bg-surface-elevated px-4 py-3">
          <p className="text-[0.625rem] uppercase tracking-wide text-content-muted">
            Hot
          </p>
          <p className="mt-0.5 font-mono text-small text-danger-soft">
            {campaign.hot}
          </p>
        </div>
      </div>

      {/* Qualification rate + trend */}
      <div className="relative flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-caption text-content-secondary">
            Qualification rate
          </span>
          <span className="font-mono text-caption text-content">
            {qualifyRate}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            style={{ width: `${qualifyRate}%` }}
            className="h-full rounded-full bg-gradient-to-r from-electric-500 to-indigo-blue-500"
          />
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-caption text-content-muted">
            <TrendingUp className="size-3.5" />
            {campaign.replyRate > 0
              ? `${campaign.replyRate}% reply rate`
              : "Not started"}
          </div>
          <div className="w-20">
            <Sparkline
              data={campaign.trend}
              tone={campaign.status === "paused" ? "warning" : "electric"}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function CampaignGrid({ status }: { status?: CampaignStatus }) {
  const campaigns = status
    ? demoCampaigns.filter((c) => c.status === status)
    : demoCampaigns;

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line px-6 py-16 text-center">
        <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-content-muted">
          <MoreHorizontal className="size-5" />
        </span>
        <p className="text-body font-medium text-content">
          No {status} campaigns
        </p>
        <p className="max-w-sm text-small text-content-secondary">
          Campaigns you move to this state will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

/* Compact list view — same data, denser presentation. */
function CampaignList({ status }: { status?: CampaignStatus }) {
  const campaigns = status
    ? demoCampaigns.filter((c) => c.status === status)
    : demoCampaigns;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-elevated">
      <div className="hidden grid-cols-[2.5fr_1fr_1fr_1fr_5rem_2.5rem] gap-4 border-b border-line bg-canvas-subtle px-5 py-2.5 lg:grid">
        {["Campaign", "Prospects", "Qualified", "Hot", "Trend", ""].map(
          (heading, i) => (
            <span
              key={heading || i}
              className={`text-overline uppercase text-content-muted ${
                i > 0 && i < 4 ? "text-right" : ""
              }`}
            >
              {heading}
            </span>
          )
        )}
      </div>

      <div className="divide-y divide-line-subtle">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.022] lg:grid-cols-[2.5fr_1fr_1fr_1fr_5rem_2.5rem] lg:items-center lg:gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-small font-medium text-content">
                  {campaign.name}
                </p>
                <Badge variant={statusVariant[campaign.status]} size="sm" dot>
                  {campaign.status}
                </Badge>
              </div>
              <p className="mt-1 truncate text-caption text-content-muted">
                {campaign.criteria}
              </p>
            </div>

            {/* Mobile stat strip */}
            <div className="flex items-center gap-4 lg:hidden">
              <span className="inline-flex items-center gap-1.5 text-caption text-content-secondary">
                <Users className="size-3.5 text-content-muted" />
                {campaign.prospects.toLocaleString()}
              </span>
              <span className="text-caption text-content-secondary">
                {campaign.qualified} qualified
              </span>
              <span className="text-caption text-danger-soft">
                {campaign.hot} hot
              </span>
            </div>

            <span className="hidden text-right font-mono text-small text-content-secondary lg:block">
              {campaign.prospects.toLocaleString()}
            </span>
            <span className="hidden text-right font-mono text-small text-content lg:block">
              {campaign.qualified}
            </span>
            <span className="hidden text-right font-mono text-small text-danger-soft lg:block">
              {campaign.hot}
            </span>
            <span className="hidden lg:block">
              <Sparkline
                data={campaign.trend}
                tone={campaign.status === "paused" ? "warning" : "electric"}
              />
            </span>
            <span className="hidden justify-self-end lg:block">
              <CampaignRowActions name={campaign.name} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CampaignCard, CampaignGrid, CampaignList };
