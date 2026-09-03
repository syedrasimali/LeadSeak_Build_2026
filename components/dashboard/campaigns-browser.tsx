"use client";

import * as React from "react";
import {
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Target,
  TrendingUp,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Sparkline } from "@/components/dashboard/charts/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsListUnderline,
  TabsTrigger,
  TabsTriggerUnderline,
} from "@/components/ui/tabs";
import {
  deleteCampaignAction,
  updateCampaignStatusAction,
} from "@/app/actions/campaigns";
import { discoverProspectsAction } from "@/app/actions/discovery";
import { toast } from "@/components/ui/toast";
import type { Campaign, CampaignStatus } from "@/types/db";

const statusVariant: Record<
  CampaignStatus,
  "success" | "warning" | "neutral" | "electric"
> = {
  active: "success",
  paused: "warning",
  draft: "neutral",
  completed: "electric",
};

const FILTERS: { value: CampaignStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Drafts" },
  { value: "completed", label: "Completed" },
];

function countFor(campaigns: Campaign[], status: CampaignStatus | "all") {
  return status === "all"
    ? campaigns.length
    : campaigns.filter((c) => c.status === status).length;
}

function syntheticTrend(createdAt: string): number[] {
  const ageDays = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
  );
  const points: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const progress = (8 - i) / 8;
    const ageFactor = Math.min(1, ageDays / 30);
    points.push(Math.round(progress * ageFactor * 40 + 5));
  }
  return points;
}

function CampaignRowActions({
  campaign,
  onEdit,
}: {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  async function changeStatus(status: CampaignStatus) {
    setBusy(status);
    await updateCampaignStatusAction(campaign.id, status);
    setBusy(null);
    setOpen(false);
    const label = status === "completed" ? "archived" : status === "active" ? "resumed" : status === "paused" ? "paused" : "set to draft";
    toast.success(`Campaign ${label}`, {
      description: `"${campaign.name}" has been ${label}.`,
    });
  }

  async function remove() {
    setBusy("delete");
    await deleteCampaignAction(campaign.id);
    setBusy(null);
    setOpen(false);
    toast.success("Campaign deleted", {
      description: `"${campaign.name}" has been permanently removed.`,
    });
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Actions for ${campaign.name}`}
        onClick={() => setOpen((o) => !o)}
        disabled={busy !== null}
      >
        <MoreHorizontal />
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-40 mt-1 w-52 overflow-hidden rounded-lg border border-line bg-surface-elevated shadow-overlay">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                setOpen(false);
                onEdit(campaign);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-small text-content-secondary transition-colors hover:bg-white/[0.06] hover:text-content disabled:opacity-50"
            >
              Edit campaign
            </button>
            <div className="my-1.5 h-px bg-line" />
            <div className="px-2 py-1.5 text-overline uppercase text-content-muted">
              Status
            </div>
            {(
              ["draft", "active", "paused", "completed"] as CampaignStatus[]
            ).map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy !== null || campaign.status === status}
                onClick={() => changeStatus(status)}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-small text-content-secondary transition-colors hover:bg-white/[0.06] hover:text-content disabled:opacity-50"
              >
                <span
                  className={`size-1.5 rounded-full ${
                    status === "active"
                      ? "bg-success"
                      : status === "paused"
                        ? "bg-warning"
                        : status === "draft"
                          ? "bg-content-muted"
                          : "bg-electric-400"
                  }`}
                />
                {status === "completed" ? "Archive" : status}
                {campaign.status === status && (
                  <span className="ml-auto text-caption text-content-muted">
                    current
                  </span>
                )}
              </button>
            ))}
            <div className="my-1.5 h-px bg-line" />
            <button
              type="button"
              disabled={busy !== null}
              onClick={remove}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-small text-danger-soft transition-colors hover:bg-danger/10 disabled:opacity-50"
            >
              {busy === "delete" ? "Deleting…" : "Delete campaign"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DiscoverButton({ campaign }: { campaign: Campaign }) {
  const [status, setStatus] = React.useState<
    "idle" | "preparing" | "discovering" | "processing" | "saving" | "completed" | "error"
  >("idle");
  const [message, setMessage] = React.useState("");

  const hasCriteria =
    campaign.industry ||
    campaign.location ||
    campaign.keywords ||
    campaign.target_description;

  async function handleDiscover() {
    setStatus("preparing");
    setMessage("Preparing discovery...");

    await new Promise((r) => setTimeout(r, 500));
    setStatus("discovering");
    setMessage("Discovering prospects...");

    const result = await discoverProspectsAction(campaign.id);

    if (result.status === "error") {
      setStatus("error");
      setMessage(result.message);
      return;
    }

    if (result.leadsFound === 0) {
      setStatus("completed");
      setMessage(result.message);
      return;
    }

    setStatus("processing");
    setMessage("Processing results...");
    await new Promise((r) => setTimeout(r, 400));

    setStatus("saving");
    setMessage("Saving prospects...");
    await new Promise((r) => setTimeout(r, 300));

    setStatus("completed");
    setMessage(result.message);
  }

  if (status === "completed" || status === "error") {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-canvas-subtle p-3">
        {status === "completed" ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-soft" />
        ) : (
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger-soft" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-caption text-content-secondary">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          className="shrink-0 text-caption text-content-muted underline transition-colors hover:text-content"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (status !== "idle") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-electric-500/24 bg-electric-500/5 p-3">
        <Loader2 className="size-4 animate-spin text-electric-400" />
        <p className="text-caption text-content-secondary">{message}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDiscover}
      disabled={!hasCriteria}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-electric-500/24 bg-electric-500/10 px-3 py-2 text-small font-medium text-electric-400 transition-all hover:border-electric-500/40 hover:bg-electric-500/15 disabled:cursor-not-allowed disabled:opacity-50"
      title={
        !hasCriteria
          ? "Add industry, location, keywords, or target description first"
          : "Discover prospects using Exa AI"
      }
    >
      <Search className="size-3.5" />
      Discover prospects
    </button>
  );
}

function CampaignCard({
  campaign,
  onEdit,
}: {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-elevated transition-all duration-300 ease-premium hover:border-line-strong hover:bg-surface-hover">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 surface-sheen"
      />

      <div className="relative flex items-start gap-3 p-5 pb-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-electric-500/24 bg-electric-500/10 text-electric-400">
          <Target className="size-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body font-semibold text-content">
            {campaign.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-caption text-content-muted">
            {campaign.industry ?? campaign.target_description ?? "—"}
          </p>
        </div>

        <CampaignRowActions campaign={campaign} onEdit={onEdit} />
      </div>

      <div className="relative flex items-center gap-2 px-5 pb-4">
        <Badge variant={statusVariant[campaign.status]} size="sm" dot>
          {campaign.status === "completed" ? "archived" : campaign.status}
        </Badge>
        <span className="font-mono text-[0.625rem] text-content-disabled">
          {new Date(campaign.created_at).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col gap-3 p-5 pt-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-caption text-content-secondary">Trend</span>
          <span className="inline-flex items-center gap-1.5 text-caption text-content-muted">
            <TrendingUp className="size-3.5" />
            {campaign.location ?? "—"}
          </span>
        </div>
        <div className="h-10">
          <Sparkline
            data={syntheticTrend(campaign.created_at)}
            tone={campaign.status === "paused" ? "warning" : "electric"}
          />
        </div>
      </div>

      <div className="relative border-t border-line p-5 pt-4">
        <DiscoverButton campaign={campaign} />
      </div>
    </article>
  );
}

function CampaignGrid({
  campaigns,
  onEdit,
}: {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
}) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line px-6 py-16 text-center">
        <p className="text-body font-medium text-content">
          No campaigns here
        </p>
        <p className="max-w-sm text-small text-content-secondary">
          Campaigns you move to this status will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onEdit={onEdit} />
      ))}
    </div>
  );
}

function CampaignList({
  campaigns,
  onEdit,
}: {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-elevated">
      <div className="hidden grid-cols-[2.5fr_1fr_1fr_5rem_2.5rem] gap-4 border-b border-line bg-canvas-subtle px-5 py-2.5 lg:grid">
        {["Campaign", "Industry", "Location", "Trend", ""].map(
          (heading, i) => (
            <span
              key={heading || i}
              className="text-overline uppercase text-content-muted"
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
            className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.022] lg:grid-cols-[2.5fr_1fr_1fr_5rem_2.5rem] lg:items-center lg:gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-small font-medium text-content">
                  {campaign.name}
                </p>
                <Badge variant={statusVariant[campaign.status]} size="sm" dot>
                  {campaign.status === "completed" ? "archived" : campaign.status}
                </Badge>
              </div>
              <p className="mt-1 truncate text-caption text-content-muted">
                {campaign.target_description ?? campaign.keywords ?? "—"}
              </p>
            </div>

            <span className="hidden text-small text-content-secondary lg:block">
              {campaign.industry ?? "—"}
            </span>
            <span className="hidden text-small text-content-secondary lg:block">
              {campaign.location ?? "—"}
            </span>
            <span className="hidden lg:block">
              <Sparkline
                data={syntheticTrend(campaign.created_at)}
                tone={campaign.status === "paused" ? "warning" : "electric"}
              />
            </span>
            <span className="hidden justify-self-end lg:block">
              <CampaignRowActions campaign={campaign} onEdit={onEdit} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignsBrowser({
  campaigns,
  onCreateClick,
  onEdit,
}: {
  campaigns: Campaign[];
  onCreateClick: () => void;
  onEdit: (campaign: Campaign) => void;
}) {
  const [status, setStatus] = React.useState<CampaignStatus | "all">("all");
  const [view, setView] = React.useState<"cards" | "list">("cards");

  const filtered =
    status === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === status);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as CampaignStatus | "all")}
          className="min-w-0 flex-1"
        >
          <TabsListUnderline className="overflow-x-auto">
            {FILTERS.map((filter) => {
              const variant:
                | "success"
                | "warning"
                | "neutral"
                | "electric" =
                filter.value === "all"
                  ? "neutral"
                  : statusVariant[filter.value];
              return (
                <TabsTriggerUnderline key={filter.value} value={filter.value}>
                  {filter.label}
                  <Badge variant={variant} size="sm">
                    {countFor(campaigns, filter.value)}
                  </Badge>
                </TabsTriggerUnderline>
              );
            })}
          </TabsListUnderline>
        </Tabs>

        <div className="flex shrink-0 items-center gap-3">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "cards" | "list")}
          >
            <TabsList>
              <TabsTrigger value="cards">
                <LayoutGrid />
                Cards
              </TabsTrigger>
              <TabsTrigger value="list">
                <List />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button size="sm" onClick={onCreateClick}>
            <Plus />
            New campaign
          </Button>
        </div>
      </div>

      <div className="mt-5">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-6 py-12 text-center">
            <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-content-muted">
              <Target className="size-5" />
            </span>
            <p className="text-body font-medium text-content">
              No campaigns yet
            </p>
            <p className="max-w-sm text-small text-content-secondary">
              Create your first campaign to start discovering prospects.
            </p>
            <Button size="sm" onClick={onCreateClick}>
              <Plus />
              New campaign
            </Button>
          </div>
        ) : view === "cards" ? (
          <CampaignGrid campaigns={filtered} onEdit={onEdit} />
        ) : (
          <CampaignList campaigns={filtered} onEdit={onEdit} />
        )}
      </div>
    </>
  );
}

export { CampaignsBrowser };
