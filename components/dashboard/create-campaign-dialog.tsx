"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LabeledSelect } from "@/components/ui/select";
import {
  createCampaignAction,
  updateCampaignAction,
} from "@/app/actions/campaigns";
import { toast } from "@/components/ui/toast";
import type { Campaign, CampaignStatus } from "@/types/db";

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
}: CampaignFormDialogProps) {
  const isEdit = !!campaign;
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setStatus("idle");
      setMessage("");
    }
  }, [open]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;

    setStatus("loading");
    setMessage("");

    const payload = {
      name,
      industry: String(form.get("industry") ?? "").trim() || null,
      location: String(form.get("location") ?? "").trim() || null,
      keywords: String(form.get("keywords") ?? "").trim() || null,
      target_description: String(form.get("description") ?? "").trim() || null,
      additional_criteria: String(form.get("criteria") ?? "").trim() || null,
    };

    let error: string | null;

    if (isEdit && campaign) {
      const result = await updateCampaignAction(campaign.id, payload);
      error = result.error;
    } else {
      const statusVal = String(form.get("status") ?? "draft") as CampaignStatus;
      const result = await createCampaignAction({ ...payload, status: statusVal });
      error = result.error;
    }

    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }

    toast.success(isEdit ? "Campaign updated" : "Campaign created", {
      description: isEdit
        ? `"${name}" has been updated.`
        : `"${name}" is ready for discovery.`,
    });

    onOpenChange(false);
    setStatus("idle");
    setMessage("");
  }

  const loading = status === "loading";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit campaign" : "Create campaign"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the discovery criteria for this campaign."
              : "Describe the accounts you want. LeadSeak turns this into discovery criteria."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <DialogBody className="flex flex-col gap-4">
            <Field label="Campaign name" htmlFor="cmp-name" required>
              <Input
                id="cmp-name"
                name="name"
                required
                defaultValue={campaign?.name ?? ""}
                placeholder="USA Plumbers"
                disabled={loading}
              />
            </Field>

            <Field
              label="Target description"
              htmlFor="cmp-desc"
              hint="Plain language works best — industry, size, region, and any buying signals."
            >
              <Textarea
                id="cmp-desc"
                name="description"
                defaultValue={campaign?.target_description ?? ""}
                placeholder="Licensed plumbers and plumbing companies in the US with 5–50 employees, specializing in residential services."
                disabled={loading}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Industry" htmlFor="cmp-industry">
                <Input
                  id="cmp-industry"
                  name="industry"
                  defaultValue={campaign?.industry ?? ""}
                  placeholder="Plumbing, SaaS, Fintech…"
                  disabled={loading}
                />
              </Field>

              <Field label="Location" htmlFor="cmp-location">
                <Input
                  id="cmp-location"
                  name="location"
                  defaultValue={campaign?.location ?? ""}
                  placeholder="United States, EU, Berlin…"
                  disabled={loading}
                />
              </Field>
            </div>

            <Field
              label="Keywords"
              htmlFor="cmp-keywords"
              hint="Comma-separated terms that describe your ideal prospect."
            >
              <Input
                id="cmp-keywords"
                name="keywords"
                defaultValue={campaign?.keywords ?? ""}
                placeholder="plumber, plumbing company, plumbing contractor"
                disabled={loading}
              />
            </Field>

            <Field
              label="Additional criteria"
              htmlFor="cmp-criteria"
              hint="Any other filters or requirements not covered above."
            >
              <Textarea
                id="cmp-criteria"
                name="criteria"
                defaultValue={campaign?.additional_criteria ?? ""}
                placeholder="Must have a website, minimum 2 years in business, no franchise affiliations…"
                disabled={loading}
              />
            </Field>

            {!isEdit && (
              <Field label="Initial status" htmlFor="cmp-status">
                <LabeledSelect
                  id="cmp-status"
                  name="status"
                  defaultValue="draft"
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active" },
                    { value: "paused", label: "Paused" },
                  ]}
                />
              </Field>
            )}

            {status === "error" && message && (
              <p
                role="alert"
                className="rounded-md border border-danger/28 bg-danger/[0.08] px-3 py-2 text-caption text-danger-soft"
              >
                {message}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={loading}>
              {isEdit ? "Save changes" : "Create campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
