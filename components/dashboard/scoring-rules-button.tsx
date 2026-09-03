"use client";

import { SlidersHorizontal, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const signals = [
  {
    name: "Firmographic fit",
    weight: "35%",
    description:
      "Company size, industry, and location match against your campaign criteria.",
  },
  {
    name: "Buying signals",
    weight: "25%",
    description:
      "Recent funding, hiring spikes, technology changes, or market expansion.",
  },
  {
    name: "Contact quality",
    weight: "20%",
    description:
      "Decision-maker title, verified email, and LinkedIn presence.",
  },
  {
    name: "Engagement history",
    weight: "10%",
    description:
      "Prior replies, meeting attendance, or content interactions.",
  },
  {
    name: "Timing",
    weight: "5%",
    description:
      "Recency of discovery — newer leads get a small boost.",
  },
  {
    name: "Data completeness",
    weight: "5%",
    description:
      "How many fields are populated — richer profiles score higher.",
  },
];

const thresholds = [
  { label: "Hot", range: "Score >= threshold (default 80)", color: "text-danger-soft" },
  { label: "Warm", range: "Score 50–79", color: "text-warning-soft" },
  { label: "Cold", range: "Score < 50", color: "text-electric-300" },
];

export function ScoringRulesButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <SlidersHorizontal />
          Scoring rules
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>How lead scoring works</DialogTitle>
          <DialogDescription>
            LeadSeak scores every prospect on a 0–100 scale using six weighted
            signals. The composite score determines temperature classification.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div>
            <h4 className="text-overline mb-2 uppercase text-content-muted">
              Signal weights
            </h4>
            <ul className="flex flex-col gap-2.5">
              {signals.map((s) => (
                <li key={s.name} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-electric-500/12 font-mono text-[0.65rem] font-semibold text-electric-300">
                    {s.weight}
                  </span>
                  <div>
                    <p className="text-small font-medium text-content">
                      {s.name}
                    </p>
                    <p className="text-caption text-content-muted">
                      {s.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-line bg-canvas-subtle/50 px-4 py-3">
            <h4 className="text-overline mb-2 uppercase text-content-muted">
              Temperature thresholds
            </h4>
            <ul className="flex flex-col gap-1.5">
              {thresholds.map((t) => (
                <li key={t.label} className="flex items-center gap-2 text-small">
                  <span className={`font-medium ${t.color}`}>{t.label}</span>
                  <span className="text-content-muted">{t.range}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 flex items-center gap-1.5 text-caption text-content-disabled">
              <Info className="size-3" />
              Adjust the hot threshold in Settings.
            </p>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
