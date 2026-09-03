import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TemperatureBadge } from "@/components/dashboard/temperature-badge";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { demoLeads } from "@/lib/demo-data";

function RecentLeads() {
  const leads = demoLeads.slice(0, 6);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-body font-semibold text-content">Recent leads</h2>
          <p className="mt-0.5 text-caption text-content-muted">
            Newest qualified prospects
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/leads">
            All
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 flex-col divide-y divide-line-subtle">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center gap-3 px-5 py-3 transition-colors duration-200 hover:bg-white/[0.022]"
          >
            <UserAvatar name={lead.name} size="sm" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-medium text-content">
                {lead.name}
              </p>
              <p className="truncate text-caption text-content-muted">
                {lead.role} · {lead.company}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <span className="font-mono text-small text-content-secondary">
                {lead.score}
              </span>
              <TemperatureBadge value={lead.temperature} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { RecentLeads };
