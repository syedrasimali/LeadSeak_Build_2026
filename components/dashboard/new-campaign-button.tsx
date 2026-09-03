"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CampaignFormDialog } from "@/components/dashboard/create-campaign-dialog";
import { Button } from "@/components/ui/button";

function NewCampaignButton({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  return (
    <>
      <Button size="sm" className={className} onClick={() => setOpen(true)}>
        <Plus />
        New campaign
      </Button>
      <CampaignFormDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) router.refresh();
        }}
      />
    </>
  );
}

export { NewCampaignButton };
