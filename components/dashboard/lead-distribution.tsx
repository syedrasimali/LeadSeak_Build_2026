import { DonutChart } from "@/components/dashboard/charts/donut-chart";
import { demoTotals } from "@/lib/demo-data";

const segments = [
  {
    label: "Hot",
    value: demoTotals.hotLeads,
    color: "var(--color-danger)",
    swatch: "bg-danger",
    range: "80–100",
  },
  {
    label: "Warm",
    value: demoTotals.warmLeads,
    color: "var(--color-warning)",
    swatch: "bg-warning",
    range: "50–79",
  },
  {
    label: "Cold",
    value: demoTotals.coldLeads,
    color: "var(--color-electric-500)",
    swatch: "bg-electric-500",
    range: "0–49",
  },
];

function LeadDistribution() {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated">
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
          segments={segments}
          centerValue={total.toLocaleString()}
          centerLabel="leads"
        />

        <div className="flex w-full flex-col gap-2.5">
          {segments.map((segment) => {
            const pct = Math.round((segment.value / total) * 100);
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

export { LeadDistribution };
