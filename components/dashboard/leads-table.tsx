"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";
import { TemperatureBadge } from "@/components/dashboard/temperature-badge";
import { LeadDetailPanel } from "@/components/dashboard/lead-detail-panel";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LabeledSelect,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { demoLeads, type DemoLead, type Temperature } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type TempFilter = "all" | Temperature;
type StageFilter = "all" | DemoLead["stage"];
type SortKey = "score" | "name" | "company" | "recent";

const stages: DemoLead["stage"][] = [
  "New",
  "Contacted",
  "Replied",
  "Qualified",
  "Won",
];

const stageTone: Record<DemoLead["stage"], string> = {
  New: "text-content-muted",
  Contacted: "text-electric-300",
  Replied: "text-indigo-blue-300",
  Qualified: "text-warning-soft",
  Won: "text-success-soft",
};

function LeadsTable() {
  const [query, setQuery] = React.useState("");
  const [temp, setTemp] = React.useState<TempFilter>("all");
  const [stage, setStage] = React.useState<StageFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("score");
  const [ascending, setAscending] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [activeLead, setActiveLead] = React.useState<DemoLead | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    const rows = demoLeads.filter((lead) => {
      if (temp !== "all" && lead.temperature !== temp) return false;
      if (stage !== "all" && lead.stage !== stage) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.role.toLowerCase().includes(q) ||
        lead.industry.toLowerCase().includes(q)
      );
    });

    const sorted = [...rows].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "company":
          return a.company.localeCompare(b.company);
        case "recent":
          return demoLeads.indexOf(a) - demoLeads.indexOf(b);
        default:
          return b.score - a.score;
      }
    });

    return ascending ? sorted.reverse() : sorted;
  }, [query, temp, stage, sort, ascending]);

  const hasFilters = query !== "" || temp !== "all" || stage !== "all";
  const allVisibleSelected =
    filtered.length > 0 && filtered.every((l) => selected.includes(l.id));

  function openLead(lead: DemoLead) {
    setActiveLead(lead);
    setPanelOpen(true);
  }

  function toggleAll() {
    setSelected(allVisibleSelected ? [] : filtered.map((l) => l.id));
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function clearFilters() {
    setQuery("");
    setTemp("all");
    setStage("all");
  }

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:max-w-sm lg:flex-1">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, company, role, or email…"
            leadingIcon={<Search />}
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
              defaultValue={temp}
              onValueChange={(v) => setTemp(v as TempFilter)}
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
              aria-label="Filter by stage"
              defaultValue={stage}
              onValueChange={(v) => setStage(v as StageFilter)}
              options={[
                { value: "all", label: "All stages" },
                ...stages.map((s) => ({ value: s, label: s })),
              ]}
            />
          </div>

          <div className="min-w-28 flex-1 sm:flex-none sm:w-40">
            <LabeledSelect
              aria-label="Sort by"
              defaultValue={sort}
              onValueChange={(v) => setSort(v as SortKey)}
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

      {/* Selection bar */}
      <div
        className={cn(
          "mt-3 flex items-center gap-3 overflow-hidden rounded-lg border border-electric-500/24 bg-electric-500/[0.07] px-4 transition-all duration-300 ease-premium",
          selected.length > 0
            ? "max-h-16 py-2.5 opacity-100"
            : "max-h-0 border-transparent py-0 opacity-0"
        )}
      >
        <span className="text-small font-medium text-content">
          {selected.length} selected
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      </div>

      {/* Table */}
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
                  Lead
                </th>
                <th className="hidden px-4 py-2.5 text-left text-overline uppercase text-content-muted lg:table-cell">
                  Company
                </th>
                <th className="hidden px-4 py-2.5 text-left text-overline uppercase text-content-muted xl:table-cell">
                  Campaign
                </th>
                <th className="px-4 py-2.5 text-left text-overline uppercase text-content-muted">
                  Stage
                </th>
                <th className="px-4 py-2.5 text-right text-overline uppercase text-content-muted">
                  Score
                </th>
                <th className="px-4 py-2.5 text-left text-overline uppercase text-content-muted">
                  Temp
                </th>
                <th className="w-20 px-4 py-2.5" />
              </tr>
            </thead>

            <tbody>
              {filtered.map((lead) => {
                const isSelected = selected.includes(lead.id);
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
                        aria-label={`Select ${lead.name}`}
                        className="size-3.5 rounded-xs border-line-strong bg-surface accent-electric-500"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500"
                      >
                        <UserAvatar name={lead.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-small font-medium text-content transition-colors group-hover:text-electric-200">
                            {lead.name}
                          </span>
                          <span className="block truncate text-caption text-content-muted">
                            {lead.role}
                          </span>
                        </span>
                      </button>
                    </td>

                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="block truncate text-small text-content-secondary">
                        {lead.company}
                      </span>
                      <span className="block truncate text-caption text-content-muted">
                        {lead.industry} · {lead.location}
                      </span>
                    </td>

                    <td className="hidden max-w-48 px-4 py-3 xl:table-cell">
                      <span className="block truncate text-caption text-content-muted">
                        {lead.campaign}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-caption font-medium",
                          stageTone[lead.stage]
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {lead.stage}
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
            icon={<Filter />}
            title="No leads match these filters"
            description="Try a different search term, or clear the filters to see the full sample."
            action={
              <Button size="sm" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
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
          <span className="font-mono text-content-secondary">
            {demoLeads.length}
          </span>{" "}
          demo leads
        </p>
        <Badge variant="neutral" size="sm">
          Pagination arrives with the data layer
        </Badge>
      </div>

      <LeadDetailPanel
        lead={activeLead}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </>
  );
}

export { LeadsTable };
