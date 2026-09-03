"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { LeadsBrowser } from "@/components/dashboard/leads-browser";
import { CreateLeadDialog } from "@/components/dashboard/create-lead-dialog";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/types/db";

export function LeadsPageClient({
  leads,
  campaigns,
  industries,
  locations,
  qualifications,
}: {
  leads: Lead[];
  campaigns: { id: string; name: string }[];
  industries: string[];
  locations: string[];
  qualifications: Record<string, { reason: string | null }>;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  // Bumped on every successful mutation so the parent re-fetches. The server
  // component re-runs because the client navigates to the same URL.
  const [rev, setRev] = React.useState(0);

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button size="sm" className="shimmer-btn" onClick={() => setDialogOpen(true)}>
          <Plus />
          Add lead
        </Button>
      </div>
      <LeadsBrowser
        key={rev}
        leads={leads}
        campaigns={campaigns}
        industries={industries}
        locations={locations}
        qualifications={qualifications}
        onRefresh={() => {
          setRev((r) => r + 1);
          router.refresh();
        }}
      />
      <CreateLeadDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setRev((r) => r + 1);
            router.refresh();
          }
        }}
      />
    </>
  );
}
