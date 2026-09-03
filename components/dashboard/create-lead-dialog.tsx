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
import { createLeadAction } from "@/app/actions/leads";
import { toast } from "@/components/ui/toast";
import type { Temperature, LeadStatus } from "@/types/db";

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeadDialog({ open, onOpenChange }: CreateLeadDialogProps) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = React.useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const companyName = String(form.get("company_name") ?? "").trim();
    if (!companyName) return;

    setStatus("loading");
    setMessage("");

    const score = Number(form.get("score") ?? 50);

    const { error } = await createLeadAction({
      campaign_id: null,
      company_name: companyName,
      contact_name: String(form.get("contact_name") ?? "").trim() || null,
      job_title: String(form.get("job_title") ?? "").trim() || null,
      industry: String(form.get("industry") ?? "").trim() || null,
      location: String(form.get("location") ?? "").trim() || null,
      website: String(form.get("website") ?? "").trim() || null,
      email: String(form.get("email") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      linkedin_url: String(form.get("linkedin_url") ?? "").trim() || null,
      google_maps_url: null,
      description: String(form.get("description") ?? "").trim() || null,
      source: String(form.get("source") ?? "").trim() || null,
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 50,
      temperature: (String(form.get("temperature") ?? "cold") as Temperature),
      status: (String(form.get("status") ?? "new") as LeadStatus),
    });

    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }

    toast.success("Lead added", {
      description: `${companyName} has been added to your pipeline.`,
    });

    onOpenChange(false);
    setStatus("idle");
    setMessage("");
    event.currentTarget.reset();
  }

  const loading = status === "loading";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>
            Manually add a prospect. Discovery runs will populate this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <DialogBody className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" htmlFor="ld-company" required>
                <Input
                  id="ld-company"
                  name="company_name"
                  required
                  placeholder="Acme Corp"
                  disabled={loading}
                />
              </Field>
              <Field label="Contact name" htmlFor="ld-contact">
                <Input
                  id="ld-contact"
                  name="contact_name"
                  placeholder="Jane Doe"
                  disabled={loading}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title" htmlFor="ld-title">
                <Input
                  id="ld-title"
                  name="job_title"
                  placeholder="VP of Sales"
                  disabled={loading}
                />
              </Field>
              <Field label="Industry" htmlFor="ld-industry">
                <Input
                  id="ld-industry"
                  name="industry"
                  placeholder="SaaS, Fintech…"
                  disabled={loading}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="ld-email">
                <Input
                  id="ld-email"
                  name="email"
                  type="email"
                  placeholder="jane@acme.com"
                  disabled={loading}
                />
              </Field>
              <Field label="Location" htmlFor="ld-location">
                <Input
                  id="ld-location"
                  name="location"
                  placeholder="Berlin, DE"
                  disabled={loading}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Score (0–100)" htmlFor="ld-score">
                <Input
                  id="ld-score"
                  name="score"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={50}
                  disabled={loading}
                />
              </Field>
              <Field label="Temperature" htmlFor="ld-temp">
                <LabeledSelect
                  id="ld-temp"
                  name="temperature"
                  defaultValue="cold"
                  options={[
                    { value: "hot", label: "Hot" },
                    { value: "warm", label: "Warm" },
                    { value: "cold", label: "Cold" },
                  ]}
                />
              </Field>
              <Field label="Stage" htmlFor="ld-stage">
                <LabeledSelect
                  id="ld-stage"
                  name="status"
                  defaultValue="new"
                  options={[
                    { value: "new", label: "New" },
                    { value: "contacted", label: "Contacted" },
                    { value: "replied", label: "Replied" },
                    { value: "qualified", label: "Qualified" },
                    { value: "won", label: "Won" },
                    { value: "lost", label: "Lost" },
                  ]}
                />
              </Field>
            </div>

            <Field label="Buying signals / notes" htmlFor="ld-desc">
              <Textarea
                id="ld-desc"
                name="description"
                placeholder="Comma-separated signals: raised Series A, hiring AEs, uses HubSpot"
                disabled={loading}
              />
            </Field>

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
              Add lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
