"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
  { value: "0", label: "All time" },
];

export function DateRangeSelector({ defaultValue = "12" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "12") {
      params.delete("range");
    } else {
      params.set("range", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={defaultValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[150px]">
        <Calendar className="mr-1.5 size-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface ExportData {
  metrics: { total: number; hot: number; warm: number; cold: number; activeCampaigns: number };
  growth: { label: string; count: number }[];
  temperature: { hot: number; warm: number; cold: number };
  statusBreakdown: Record<string, number>;
  industries: { label: string; value: number }[];
  locations: { label: string; value: number }[];
}

function csvEscape(val: string | number) {
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function ExportButton({ data }: { data: ExportData }) {
  const handleExport = useCallback(() => {
    const rows: string[] = [];

    rows.push("LEADSEAK ANALYTICS REPORT");
    rows.push(`Generated,${new Date().toISOString()}`);
    rows.push("");

    rows.push("SUMMARY");
    rows.push("Metric,Value");
    rows.push(`Total Leads,${data.metrics.total}`);
    rows.push(`Hot Leads,${data.metrics.hot}`);
    rows.push(`Warm Leads,${data.metrics.warm}`);
    rows.push(`Cold Leads,${data.metrics.cold}`);
    rows.push(`Active Campaigns,${data.metrics.activeCampaigns}`);
    rows.push("");

    rows.push("LEAD GROWTH");
    rows.push("Month,Count");
    for (const p of data.growth) {
      rows.push(`${csvEscape(p.label)},${p.count}`);
    }
    rows.push("");

    rows.push("TEMPERATURE DISTRIBUTION");
    rows.push("Segment,Count");
    rows.push(`Hot,${data.temperature.hot}`);
    rows.push(`Warm,${data.temperature.warm}`);
    rows.push(`Cold,${data.temperature.cold}`);
    rows.push("");

    rows.push("LEAD STATUS");
    rows.push("Status,Count");
    for (const [status, count] of Object.entries(data.statusBreakdown)) {
      rows.push(`${csvEscape(status)},${count}`);
    }
    rows.push("");

    rows.push("TOP INDUSTRIES");
    rows.push("Industry,Count");
    for (const ind of data.industries) {
      rows.push(`${csvEscape(ind.label)},${ind.value}`);
    }
    rows.push("");

    rows.push("TOP LOCATIONS");
    rows.push("Location,Count");
    for (const loc of data.locations) {
      rows.push(`${csvEscape(loc.label)},${loc.value}`);
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leadseak-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return (
    <Button size="sm" onClick={handleExport}>
      <Download />
      Export report
    </Button>
  );
}
