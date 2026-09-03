import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Sparkline } from "@/components/dashboard/charts/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoCampaigns, type CampaignStatus } from "@/lib/demo-data";

const statusVariant: Record<
  CampaignStatus,
  "success" | "warning" | "neutral" | "electric"
> = {
  active: "success",
  paused: "warning",
  draft: "neutral",
  completed: "electric",
};

function RecentCampaigns() {
  const campaigns = demoCampaigns.slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-body font-semibold text-content">
            Recent campaigns
          </h2>
          <p className="mt-0.5 text-caption text-content-muted">
            Discovery activity by campaign
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/campaigns">
            All
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 flex-col divide-y divide-line-subtle">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.022]"
          >
            <div className="min-w-0 flex-1">
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

            <div className="hidden w-20 shrink-0 sm:block">
              <Sparkline
                data={campaign.trend}
                tone={campaign.status === "paused" ? "warning" : "electric"}
              />
            </div>

            <div className="shrink-0 text-right">
              <p className="font-mono text-small text-content">
                {campaign.qualified}
              </p>
              <p className="text-[0.625rem] text-content-muted">qualified</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { RecentCampaigns };
