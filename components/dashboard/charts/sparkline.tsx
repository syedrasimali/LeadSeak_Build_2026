import { cn } from "@/lib/utils";

interface Sparkline {
  data: number[];
  className?: string;
  tone?: "electric" | "success" | "warning" | "danger";
}

const strokes = {
  electric: "var(--color-electric-400)",
  success: "var(--color-success-soft)",
  warning: "var(--color-warning-soft)",
  danger: "var(--color-danger-soft)",
} as const;

/* Compact trend line for metric cards. No axes, no labels — shape only. */
function Sparkline({ data, className, tone = "electric" }: Sparkline) {
  const width = 100;
  const height = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pad = 2;

  const line = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - pad - ((value - min) / span) * (height - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("h-6 w-full", className)}
    >
      <path
        d={line}
        fill="none"
        stroke={strokes[tone]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export { Sparkline };
