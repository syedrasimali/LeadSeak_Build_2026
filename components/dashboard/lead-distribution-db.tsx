import { DonutChart } from "@/components/dashboard/charts/donut-chart";

interface LeadCounts {
  total: number;
  hot: number;
  warm: number;
  cold: number;
}

const SEGMENTS = [
  { key: "hot" as const, label: "Hot", swatch: "bg-danger", color: "var(--color-danger)", range: "80–100" },
  { key: "warm" as const, label: "Warm", swatch: "bg-warning", color: "var(--color-warning)", range: "50–79" },
  { key: "cold" as const, label: "Cold", swatch: "bg-electric-500", color: "var(--color-electric-500)", range: "0–49" },
];

function LeadDistributionDb({ counts }: { counts: LeadCounts }) {
  const segments = SEGMENTS.map((s) => ({
    label: s.label,
    value: counts[s.key],
    color: s.color,
    swatch: s.swatch,
    range: s.range,
  }));

  const total = counts.total;

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-body font-semibold text-content">
          Lead distribution
        </h2>
        <p className="mt-0.5 text-caption text-content-muted">
          By score temperature
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center gap-5 p-5">
        <DonutChart
          className="size-36"
          segments={segments.map(({ label, value, color }) => ({ label, value, color }))}
          centerValue={total.toLocaleString()}
          centerLabel="leads"
        />

        <div className="flex w-full flex-col gap-2.5">
          {segments.map((segment) => {
            const pct = total > 0 ? Math.round((segment.value / total) * 100) : 0;
            return (
              <div key={segment.label} className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`size-2 shrink-0 rounded-full ${segment.swatch}`}
                />
                <span className="text-small text-content">{segment.label}</span>
                <span className="font-mono text-[0.625rem] text-content-disabled">
                  {segment.range}
                </span>
                <span className="ml-auto font-mono text-small text-content-secondary">
                  {segment.value.toLocaleString()}
                </span>
                <span className="w-9 text-right font-mono text-caption text-content-muted">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { LeadDistributionDb };
