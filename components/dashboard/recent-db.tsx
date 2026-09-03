"use client";

import * as React from "react";
import type { Campaign } from "@/types/db";
import type { Lead } from "@/types/db";
import { Sparkline } from "@/components/dashboard/charts/sparkline";
import { TemperatureBadge } from "@/components/dashboard/temperature-badge";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { registerGSAP, useReducedMotion } from "@/lib/motion";
import gsap from "gsap";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* ---------- Recent campaigns ---------- */

const statusVariant = {
  active: "success",
  paused: "warning",
  draft: "neutral",
  completed: "electric",
} as const;

function syntheticTrend(qualified: number, createdAt: string): number[] {
  const seed = qualified || 0;
  const ageDays = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
  );
  const points: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const progress = (8 - i) / 8;
    const ageFactor = Math.min(1, ageDays / 30);
    points.push(Math.round(seed * progress * ageFactor * 0.9 + seed * 0.1));
  }
  return points;
}

function RecentCampaignsDb({ campaigns }: { campaigns: Campaign[] }) {
  const slice = campaigns.slice(0, 4);
  const listRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !listRef.current) return;
    registerGSAP();

    const items = listRef.current.querySelectorAll("[data-campaign-row]");
    if (!items.length) return;

    gsap.fromTo(
      items,
      { opacity: 0, x: -16 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(items);
    };
  }, [reduced, hasAnimated]);

  if (slice.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-body font-semibold text-content">
              Recent campaigns
            </h2>
            <p className="mt-0.5 text-caption text-content-muted">
              No campaigns yet
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/campaigns">
              All
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="max-w-sm text-small text-content-muted">
            Your most recent campaigns will appear here.{" "}
            <Link
              href="/dashboard/campaigns"
              className="font-medium text-electric-400 underline-offset-4 hover:underline"
            >
              Create your first campaign
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
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

      <div ref={listRef} className="flex flex-1 flex-col divide-y divide-line-subtle">
        {slice.map((campaign) => (
          <div
            key={campaign.id}
            data-campaign-row
            className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.022]"
            style={reduced ? undefined : { opacity: 0 }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-small font-medium text-content">
                  {campaign.name}
                </p>
                <Badge
                  variant={statusVariant[campaign.status]}
                  size="sm"
                  dot
                >
                  {campaign.status}
                </Badge>
              </div>
              <p className="mt-1 truncate text-caption text-content-muted">
                {campaign.industry ?? campaign.target_description ?? "—"}
              </p>
            </div>

            <div className="hidden w-20 shrink-0 sm:block">
              <Sparkline
                data={syntheticTrend(0, campaign.created_at)}
                tone={campaign.status === "paused" ? "warning" : "electric"}
              />
            </div>

            <div className="shrink-0 text-right">
              <p className="font-mono text-small text-content">—</p>
              <p className="text-[0.625rem] text-content-muted">qualified</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Recent leads ---------- */

function RecentLeadsDb({ leads }: { leads: Lead[] }) {
  const slice = leads.slice(0, 6);
  const listRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !listRef.current) return;
    registerGSAP();

    const items = listRef.current.querySelectorAll("[data-lead-row]");
    if (!items.length) return;

    gsap.fromTo(
      items,
      { opacity: 0, x: -16 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(items);
    };
  }, [reduced, hasAnimated]);

  if (slice.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-body font-semibold text-content">
              Recent leads
            </h2>
            <p className="mt-0.5 text-caption text-content-muted">
              No leads yet
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/leads">
              All
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="max-w-sm text-small text-content-muted">
            Leads from your campaigns will appear here as they are discovered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
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

      <div ref={listRef} className="flex flex-1 flex-col divide-y divide-line-subtle">
        {slice.map((lead) => (
          <div
            key={lead.id}
            data-lead-row
            className="flex items-center gap-3 px-5 py-3 transition-colors duration-200 hover:bg-white/[0.022]"
            style={reduced ? undefined : { opacity: 0 }}
          >
            <UserAvatar
              name={lead.contact_name ?? lead.company_name}
              size="sm"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-medium text-content">
                {lead.contact_name ?? lead.company_name}
              </p>
              <p className="truncate text-caption text-content-muted">
                {lead.job_title ?? "—"} · {lead.company_name}
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

export { RecentCampaignsDb, RecentLeadsDb };
