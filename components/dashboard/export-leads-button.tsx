"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { Lead } from "@/types/db";

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportLeadsCsv(leads: Lead[]) {
  const headers = [
    "Company",
    "Contact Name",
    "Job Title",
    "Email",
    "Phone",
    "Industry",
    "Location",
    "Score",
    "Temperature",
    "Status",
    "Source",
    "Website",
    "Created At",
  ];

  const rows = leads.map((l) =>
    [
      l.company_name,
      l.contact_name,
      l.job_title,
      l.email,
      l.phone,
      l.industry,
      l.location,
      l.score,
      l.temperature,
      l.status,
      l.source,
      l.website,
      l.created_at,
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportLeadsButton({ leads }: { leads: Lead[] }) {
  function handleClick() {
    if (leads.length === 0) {
      toast.error("No leads to export", {
        description: "Add some leads first, then export them as CSV.",
      });
      return;
    }
    exportLeadsCsv(leads);
    toast.success("Exported", {
      description: `${leads.length} lead${leads.length === 1 ? "" : "s"} downloaded as CSV.`,
    });
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleClick}>
      <Download />
      Export
    </Button>
  );
}
