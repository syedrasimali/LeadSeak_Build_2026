"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Globe,
  ExternalLink,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { TemperatureBadge } from "@/components/dashboard/temperature-badge";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabeledSelect } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { advanceLeadStageAction, deleteLeadAction } from "@/app/actions/leads";
import { toast } from "@/components/ui/toast";
import type { Lead, LeadStatus, Temperature } from "@/types/db";
import { cn } from "@/lib/utils";

const STAGES: LeadStatus[] = [
  "new",
  "contacted",
  "replied",
  "qualified",
  "won",
  "lost",
];

const stageTone: Record<LeadStatus, string> = {
  new: "text-content-muted",
  contacted: "text-electric-300",
  replied: "text-indigo-blue-300",
  qualified: "text-warning-soft",
  won: "text-success-soft",
  lost: "text-content-disabled",
};

function nextStage(current: LeadStatus): LeadStatus | null {
  const idx = STAGES.indexOf(current);
  if (idx === -1 || idx >= STAGES.length - 2) return null;
  return STAGES[idx + 1];
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded text-content-muted transition-colors hover:bg-white/10 hover:text-content"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check className="size-3 text-success-soft" /> : <Copy className="size-3" />}
    </button>
  );
}

function DetailRow({
  icon,
  label,
  value,
  href,
  copyable,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line-subtle py-2.5 last:border-0">
      <span className="text-content-muted [&_svg]:size-3.5">{icon}</span>
      <span className="text-caption text-content-muted">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex max-w-[60%] items-center truncate text-small text-electric-400 transition-colors hover:text-electric-300 hover:underline"
        >
          <span className="truncate">{value}</span>
          {copyable && <CopyButton value={href.startsWith("mailto:") || href.startsWith("tel:") ? value : href} label={label} />}
        </a>
      ) : (
        <span className="ml-auto flex items-center truncate text-small text-content">
          <span className="truncate">{value}</span>
          {copyable && <CopyButton value={value} label={label} />}
        </span>
      )}
    </div>
  );
}

function LeadDetailPanel(props: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
  campaignName?: string;
  qualification?: { reason: string | null };
}) {
  const { lead, open, onOpenChange } = props;

  if (!lead) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  return (
    <LeadDetailPanelInner
      lead={lead}
      open={open}
      onOpenChange={onOpenChange}
      onChanged={props.onChanged}
      campaignName={props.campaignName}
      qualification={props.qualification}
    />
  );
}

function LeadDetailPanelInner({
  lead,
  open,
  onOpenChange,
  onChanged,
  campaignName,
  qualification,
}: {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
  campaignName?: string;
  qualification?: { reason: string | null };
}) {
  const [busy, setBusy] = React.useState<string | null>(null);

  const next = nextStage(lead.status);

  async function advance() {
    if (!next) return;
    setBusy("advance");
    await advanceLeadStageAction(lead.id, next);
    setBusy(null);
    onChanged();
    toast.success("Lead updated", {
      description: `${lead.contact_name ?? lead.company_name} moved to ${next}.`,
    });
  }

  async function archive() {
    setBusy("archive");
    await advanceLeadStageAction(lead.id, lead.status === "lost" ? "won" : "lost");
    setBusy(null);
    onChanged();
    toast.success(lead.status === "lost" ? "Lead unarchived" : "Lead archived", {
      description: `${lead.contact_name ?? lead.company_name} has been ${lead.status === "lost" ? "restored" : "archived"}.`,
    });
  }

  async function remove() {
    setBusy("delete");
    await deleteLeadAction(lead.id);
    setBusy(null);
    onOpenChange(false);
    onChanged();
    toast.success("Lead deleted", {
      description: `${lead.contact_name ?? lead.company_name} has been removed.`,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start gap-3">
            <UserAvatar
              name={lead.contact_name ?? lead.company_name}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">
                {lead.contact_name ?? lead.company_name}
              </SheetTitle>
              <SheetDescription className="truncate">
                {lead.job_title ?? "—"} · {lead.company_name}
              </SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TemperatureBadge value={lead.temperature} />
                <Badge variant="outline" size="sm">
                  <span
                    className={cn(
                      "size-1.5 rounded-full bg-current",
                      stageTone[lead.status]
                    )}
                  />
                  {lead.status}
                </Badge>
                {lead.source && (
                  <Badge variant="outline" size="sm">
                    {lead.source}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <SheetBody className="flex flex-col gap-6">
          <div className="rounded-xl border border-line bg-surface-elevated p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-caption text-content-muted">Lead score</p>
                <p className="mt-0.5 font-mono text-h2 leading-none text-content">
                  {lead.score}
                  <span className="text-body text-content-disabled">/100</span>
                </p>
              </div>
            </div>

            {qualification?.reason && (
              <div className="mt-3 rounded-lg border border-electric-500/20 bg-electric-500/5 p-3">
                <p className="mb-1 text-caption font-medium text-electric-300">
                  Qualification Reason
                </p>
                <p className="text-caption text-content-secondary">
                  {qualification.reason}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="mb-1 text-overline uppercase text-content-muted">
              Contact details
            </p>
            <DetailRow
              icon={<UserRound />}
              label="Contact"
              value={lead.contact_name ?? "Not available"}
            />
            <DetailRow
              icon={<Building2 />}
              label="Company"
              value={lead.company_name}
            />
            <DetailRow
              icon={<Mail />}
              label="Email"
              value={lead.email ?? "Not available"}
              href={lead.email ? `mailto:${lead.email}` : undefined}
              copyable={!!lead.email}
            />
            <DetailRow
              icon={<Phone />}
              label="Phone"
              value={lead.phone ?? "Not available"}
              href={lead.phone ? `tel:${lead.phone}` : undefined}
              copyable={!!lead.phone}
            />
            <DetailRow
              icon={<Globe />}
              label="Website"
              value={(() => {
                try { return lead.website ? new URL(lead.website).hostname : "Not available"; }
                catch { return lead.website ?? "Not available"; }
              })()}
              href={lead.website ?? undefined}
            />
            <DetailRow
              icon={<ExternalLink />}
              label="LinkedIn"
              value={
                lead.linkedin_url
                  ? "Open profile"
                  : "Not available"
              }
              href={lead.linkedin_url ?? undefined}
            />
            <DetailRow
              icon={<MapPinned />}
              label="Google Maps"
              value={lead.google_maps_url ? "Open in Maps" : "Not available"}
              href={lead.google_maps_url ?? undefined}
            />
            <DetailRow
              icon={<MapPin />}
              label="Location"
              value={lead.location ?? "Not available"}
            />
            <DetailRow
              icon={<Building2 />}
              label="Industry"
              value={lead.industry ?? "Not available"}
            />
            {campaignName && (
              <DetailRow
                icon={<Sparkles />}
                label="Campaign"
                value={campaignName}
              />
            )}
            <DetailRow
              icon={<Calendar />}
              label="Added"
              value={new Date(lead.created_at).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
          </div>

          {lead.description && (
            <div>
              <p className="mb-2.5 text-overline uppercase text-content-muted">
                Description
              </p>
              <p className="text-caption leading-relaxed text-content-secondary">
                {lead.description}
              </p>
            </div>
          )}
        </SheetBody>

        <SheetFooter className="flex flex-col gap-2.5 sm:flex-row">
          {next && (
            <Button
              variant="secondary"
              fullWidth
              onClick={advance}
              disabled={busy !== null}
            >
              {busy === "advance" ? (
                "Updating..."
              ) : (
                <>
                  Move to {next}
                  <ChevronRight />
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            fullWidth
            onClick={archive}
            disabled={busy !== null}
          >
            {busy === "archive" ? "Archiving..." : lead.status === "lost" ? "Unarchive" : "Archive"}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={remove}
            disabled={busy !== null}
          >
            {busy === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function LeadsBrowser({
  leads,
  campaigns,
  industries,
  locations,
  qualifications,
  onRefresh,
}: {
  leads: Lead[];
  campaigns: { id: string; name: string }[];
  industries: string[];
  locations: string[];
  qualifications: Record<string, { reason: string | null }>;
  onRefresh: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [temp, setTemp] = React.useState<Temperature | "all">("all");
  const [stage, setStage] = React.useState<LeadStatus | "all">("all");
  const [campaignFilter, setCampaignFilter] = React.useState<string>("all");
  const [industryFilter, setIndustryFilter] = React.useState<string>("all");
  const [locationFilter, setLocationFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<
    "score" | "recent" | "name" | "company"
  >("score");
  const [ascending, setAscending] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = leads.filter((lead) => {
      if (temp !== "all" && lead.temperature !== temp) return false;
      if (stage !== "all" && lead.status !== stage) return false;
      if (campaignFilter !== "all" && lead.campaign_id !== campaignFilter) return false;
      if (industryFilter !== "all" && lead.industry !== industryFilter) return false;
      if (locationFilter !== "all" && lead.location !== locationFilter) return false;
      if (!q) return true;
      return (
        lead.company_name.toLowerCase().includes(q) ||
        (lead.contact_name ?? "").toLowerCase().includes(q) ||
        (lead.email ?? "").toLowerCase().includes(q) ||
        (lead.job_title ?? "").toLowerCase().includes(q) ||
        (lead.industry ?? "").toLowerCase().includes(q) ||
        (lead.location ?? "").toLowerCase().includes(q)
      );
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = (a.contact_name ?? "").localeCompare(b.contact_name ?? "");
          break;
        case "company":
          cmp = a.company_name.localeCompare(b.company_name);
          break;
        case "recent":
          cmp =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return cmp;
        default:
          cmp = b.score - a.score;
      }
      return ascending ? -cmp : cmp;
    });

    return rows;
  }, [leads, query, temp, stage, campaignFilter, industryFilter, locationFilter, sortBy, ascending]);

  const hasFilters = query !== "" || temp !== "all" || stage !== "all" || campaignFilter !== "all" || industryFilter !== "all" || locationFilter !== "all";
  const allVisibleSelected =
    filtered.length > 0 && filtered.every((l) => selected.has(l.id));

  function toggleAll() {
    if (allVisibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setTemp("all");
    setStage("all");
    setCampaignFilter("all");
    setIndustryFilter("all");
    setLocationFilter("all");
  }

  function openLead(lead: Lead) {
    setActiveLead(lead);
    setPanelOpen(true);
  }

  const campaignNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of campaigns) map[c.id] = c.name;
    return map;
  }, [campaigns]);

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:max-w-sm lg:flex-1">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, contact, industry, location..."
            leadingIcon={<span className="text-content-muted">⌕</span>}
            trailingSlot={
              query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid size-4 place-items-center rounded-xs text-content-muted transition-colors hover:text-content"
                >
                  <X className="size-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-28 flex-1 sm:flex-none sm:w-32">
            <LabeledSelect
              aria-label="Filter by temperature"
              value={temp}
              onValueChange={(v) => setTemp(v as Temperature | "all")}
              options={[
                { value: "all", label: "All temps" },
                { value: "hot", label: "Hot" },
                { value: "warm", label: "Warm" },
                { value: "cold", label: "Cold" },
              ]}
            />
          </div>

          <div className="min-w-28 flex-1 sm:flex-none sm:w-36">
            <LabeledSelect
              aria-label="Filter by status"
              value={stage}
              onValueChange={(v) => setStage(v as LeadStatus | "all")}
              options={[
                { value: "all", label: "All statuses" },
                ...STAGES.map((s) => ({ value: s, label: s })),
              ]}
            />
          </div>

          {campaigns.length > 0 && (
            <div className="min-w-28 flex-1 sm:flex-none sm:w-36">
              <LabeledSelect
                aria-label="Filter by campaign"
                value={campaignFilter}
                onValueChange={(v) => setCampaignFilter(v)}
                options={[
                  { value: "all", label: "All campaigns" },
                  ...campaigns.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
          )}

          {industries.length > 0 && (
            <div className="min-w-28 flex-1 sm:flex-none sm:w-36">
              <LabeledSelect
                aria-label="Filter by industry"
                value={industryFilter}
                onValueChange={(v) => setIndustryFilter(v)}
                options={[
                  { value: "all", label: "All industries" },
                  ...industries.map((i) => ({ value: i, label: i })),
                ]}
              />
            </div>
          )}

          {locations.length > 0 && (
            <div className="min-w-28 flex-1 sm:flex-none sm:w-36">
              <LabeledSelect
                aria-label="Filter by location"
                value={locationFilter}
                onValueChange={(v) => setLocationFilter(v)}
                options={[
                  { value: "all", label: "All locations" },
                  ...locations.map((l) => ({ value: l, label: l })),
                ]}
              />
            </div>
          )}

          <div className="min-w-28 flex-1 sm:flex-none sm:w-32">
            <LabeledSelect
              aria-label="Sort by"
              value={sortBy}
              onValueChange={(v) =>
                setSortBy(v as "score" | "recent" | "name" | "company")
              }
              options={[
                { value: "score", label: "Score" },
                { value: "recent", label: "Most recent" },
                { value: "name", label: "Name" },
                { value: "company", label: "Company" },
              ]}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setAscending((a) => !a)}
            aria-label={ascending ? "Sort descending" : "Sort ascending"}
          >
            {ascending ? <ArrowUp /> : <ArrowDown />}
          </Button>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "mt-3 flex items-center gap-3 overflow-hidden rounded-lg border border-electric-500/24 bg-electric-500/[0.07] px-4 transition-all duration-300 ease-premium",
          selected.size > 0
            ? "max-h-16 py-2.5 opacity-100"
            : "max-h-0 border-transparent py-0 opacity-0"
        )}
      >
        <span className="text-small font-medium text-content">
          {selected.size} selected
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface-elevated">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-canvas-subtle">
              <tr className="border-b border-line">
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    aria-label="Select all visible leads"
                    className="size-3.5 rounded-xs border-line-strong bg-surface accent-electric-500"
                  />
                </th>
                <th className="px-4 py-2.5 text-left text-overline uppercase text-content-muted">
                  Company
                </th>
                <th className="hidden px-4 py-2.5 text-left text-overline uppercase text-content-muted sm:table-cell">
                  Contact
                </th>
                <th className="hidden px-4 py-2.5 text-left text-overline uppercase text-content-muted md:table-cell">
                  Industry
                </th>
                <th className="hidden px-4 py-2.5 text-left text-overline uppercase text-content-muted lg:table-cell">
                  Location
                </th>
                <th className="px-4 py-2.5 text-right text-overline uppercase text-content-muted">
                  Score
                </th>
                <th className="px-4 py-2.5 text-left text-overline uppercase text-content-muted">
                  Temp
                </th>
                <th className="px-4 py-2.5 text-left text-overline uppercase text-content-muted">
                  Status
                </th>
                <th className="hidden px-4 py-2.5 text-left text-overline uppercase text-content-muted xl:table-cell">
                  Source
                </th>
                <th className="w-20 px-4 py-2.5" />
              </tr>
            </thead>

            <tbody>
              {filtered.map((lead) => {
                const isSelected = selected.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    data-selected={isSelected}
                    className="group border-b border-line-subtle transition-colors duration-150 last:border-0 hover:bg-white/[0.025] data-[selected=true]:bg-electric-500/[0.06]"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(lead.id)}
                        aria-label={`Select ${lead.contact_name ?? lead.company_name}`}
                        className="size-3.5 rounded-xs border-line-strong bg-surface accent-electric-500"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500"
                      >
                        <UserAvatar
                          name={lead.company_name}
                          size="sm"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-small font-medium text-content transition-colors group-hover:text-electric-200">
                            {lead.company_name}
                          </span>
                          <span className="block truncate text-caption text-content-muted sm:hidden">
                            {lead.contact_name ?? "—"}
                          </span>
                        </span>
                      </button>
                    </td>

                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="block truncate text-small text-content-secondary">
                        {lead.contact_name ?? "—"}
                      </span>
                      <span className="block truncate text-caption text-content-muted">
                        {lead.job_title ?? "—"}
                      </span>
                    </td>

                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="block truncate text-small text-content-secondary">
                        {lead.industry ?? "—"}
                      </span>
                    </td>

                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="block truncate text-small text-content-secondary">
                        {lead.location ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-small text-content">
                        {lead.score}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <TemperatureBadge value={lead.temperature} />
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-caption font-medium",
                          stageTone[lead.status]
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {lead.status}
                      </span>
                    </td>

                    <td className="hidden px-4 py-3 xl:table-cell">
                      <span className="block truncate text-small text-content-secondary">
                        {lead.source ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openLead(lead)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <EmptyState
            compact
            className="rounded-none border-0 border-t border-line"
            icon={<span className="text-content-muted">⌕</span>}
            title={
              leads.length === 0 ? "No leads yet" : "No leads match these filters"
            }
            description={
              leads.length === 0
                ? "Leads from your campaigns will appear here."
                : "Try a different search term, or clear the filters."
            }
            action={
              hasFilters ? (
                <Button size="sm" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-content-muted">
          Showing{" "}
          <span className="font-mono text-content-secondary">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-mono text-content-secondary">{leads.length}</span>{" "}
          leads
        </p>
      </div>

      <LeadDetailPanel
        lead={activeLead}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onChanged={onRefresh}
        campaignName={
          activeLead?.campaign_id
            ? campaignNameMap[activeLead.campaign_id]
            : undefined
        }
        qualification={
          activeLead?.id ? qualifications[activeLead.id] : undefined
        }
      />
    </>
  );
}

export { LeadsBrowser };
