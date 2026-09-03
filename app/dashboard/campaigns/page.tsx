import type { Metadata } from "next";
import { listCampaigns } from "@/services/campaigns";
import { CampaignsPageClient } from "./client";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await listCampaigns();

  return (
    <>
      <PageHeader
        eyebrow="Discovery"
        title="Campaigns"
        description="Each campaign holds a set of target criteria and the prospects discovered against it."
      />

      <div data-reveal-load style={{ animationDelay: "0.2s" }}>
        <CampaignsPageClient campaigns={campaigns} />
      </div>
    </>
  );
}
