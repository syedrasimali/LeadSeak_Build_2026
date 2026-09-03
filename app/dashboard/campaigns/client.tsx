"use client";

import * as React from "react";
import { CampaignsBrowser } from "@/components/dashboard/campaigns-browser";
import { CampaignFormDialog } from "@/components/dashboard/create-campaign-dialog";
import type { Campaign } from "@/types/db";

export function CampaignsPageClient({ campaigns }: { campaigns: Campaign[] }) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Campaign | null>(null);

  return (
    <>
      <CampaignsBrowser
        campaigns={campaigns}
        onCreateClick={() => setCreateOpen(true)}
        onEdit={(campaign) => setEditing(campaign)}
      />
      <CampaignFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <CampaignFormDialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        campaign={editing ?? undefined}
      />
    </>
  );
}
