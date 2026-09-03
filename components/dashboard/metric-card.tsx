"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/dashboard/charts/sparkline";
import { cn } from "@/lib/utils";

type Tone = "electric" | "success" | "warning" | "danger";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon?: React.ReactNode;
  series?: number[];
  tone?: Tone;
  className?: string;
}

const accentRing: Record<Tone, string> = {
  electric: "border-electric-500/24 bg-electric-500/10 text-electric-400",
  success: "border-success/26 bg-success/10 text-success-soft",
  warning: "border-warning/26 bg-warning/10 text-warning-soft",
  danger: "border-danger/26 bg-danger/10 text-danger-soft",
};

const glowColor: Record<Tone, string> = {
  electric: "rgba(52, 120, 255, 0.12)",
  success: "rgba(16, 185, 129, 0.12)",
  warning: "rgba(245, 158, 11, 0.12)",
  danger: "rgba(239, 68, 68, 0.12)",
};

function MetricCard({
  label,
  value,
  delta,
  trend,
  icon,
  series,
  tone = "electric",
  className,
}: MetricCardProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-elevated p-4 sm:p-5",
        "transition-all duration-300 ease-premium hover:border-line-strong hover:bg-surface-hover",
        "hover:shadow-[0_0_24px_-8px_var(--glow-color,rgba(52,120,255,0.2))]",
        className
      )}
      style={{ "--glow-color": glowColor[tone] } as React.CSSProperties}
    >
      {/* Mouse-tracking glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(20rem 20rem at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glow-color, rgba(52,120,255,0.12)) 0%, transparent 60%)",
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 surface-sheen" />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-label text-content-secondary">{label}</p>
        {icon && (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md border transition-all duration-300",
              "group-hover:scale-110",
              accentRing[tone]
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <p className="relative mt-2.5 font-mono text-h2 leading-none tracking-tight text-content">
        {value}
      </p>

      {delta && (
        <div className="relative mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-caption font-medium",
              trend === "down" ? "text-danger-soft" : "text-success-soft"
            )}
          >
            <TrendIcon className="size-3" />
            {delta}
          </span>
          <span className="text-caption text-content-muted">30d</span>
        </div>
      )}

      {series && (
        <div className="relative mt-4">
          <Sparkline data={series} tone={tone} />
        </div>
      )}
    </div>
  );
}

export { MetricCard };
