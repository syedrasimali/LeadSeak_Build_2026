import { Badge } from "@/components/ui/badge";
import type { CampaignStats } from "@/services/analytics";
import type { CampaignStatus } from "@/types/db";

const statusVariant: Record<
  CampaignStatus,
  "success" | "warning" | "neutral" | "electric"
> = {
  active: "success",
  paused: "warning",
  draft: "neutral",
  completed: "electric",
};

function CampaignPerformance({
  campaigns,
}: {
  campaigns: CampaignStats[];
}) {
  if (campaigns.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface-elevated">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-body font-semibold text-content">
            Campaign performance
          </h2>
          <p className="mt-0.5 text-caption text-content-muted">
            Volume, qualification, and reply rate side by side
          </p>
        </div>
        <div className="px-5 py-10 text-center text-caption text-content-muted">
          No campaigns yet. Create a campaign and run discovery to see
          performance data.
        </div>
      </div>
    );
  }

  const maxLeads = Math.max(...campaigns.map((c) => c.leads));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-elevated">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-body font-semibold text-content">
          Campaign performance
        </h2>
        <p className="mt-0.5 text-caption text-content-muted">
          Volume, qualification, and pipeline by campaign
        </p>
      </div>

      <div className="divide-y divide-line-subtle">
        {campaigns.map((campaign) => {
          const qualified =
            campaign.byStatus.qualified +
            campaign.byStatus.won;
          const qualifyRate = campaign.leads
            ? Math.round((qualified / campaign.leads) * 100)
            : 0;
          const volumeShare = maxLeads
            ? Math.round((campaign.leads / maxLeads) * 100)
            : 0;
          const replied = campaign.byStatus.replied;
          const replyRate = campaign.leads
            ? Math.round((replied / campaign.leads) * 100)
            : 0;

          return (
            <div
              key={campaign.id}
              className="px-5 py-4 transition-colors duration-200 hover:bg-white/[0.022]"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="min-w-0 flex-1 truncate text-small font-medium text-content">
                  {campaign.name}
                </p>
                <Badge variant={statusVariant[campaign.status]} size="sm" dot>
                  {campaign.status}
                </Badge>
              </div>

              {/* Volume bar */}
              <div className="mt-3 flex items-center gap-3">
                <span className="w-16 shrink-0 text-[0.625rem] uppercase tracking-wide text-content-muted">
                  Volume
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    style={{ width: `${volumeShare}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-electric-600/70 to-electric-400"
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-caption text-content-secondary">
                  {campaign.leads.toLocaleString()}
                </span>
              </div>

              {/* Qualification bar */}
              <div className="mt-2 flex items-center gap-3">
                <span className="w-16 shrink-0 text-[0.625rem] uppercase tracking-wide text-content-muted">
                  Qualified
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    style={{ width: `${qualifyRate}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-blue-600/70 to-indigo-blue-400"
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-caption text-content-secondary">
                  {qualifyRate}%
                </span>
              </div>

              {/* Reply bar */}
              <div className="mt-2 flex items-center gap-3">
                <span className="w-16 shrink-0 text-[0.625rem] uppercase tracking-wide text-content-muted">
                  Replies
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    style={{ width: `${replyRate}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-success/70 to-success-soft"
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-caption text-content-secondary">
                  {replyRate}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CampaignPerformance };
