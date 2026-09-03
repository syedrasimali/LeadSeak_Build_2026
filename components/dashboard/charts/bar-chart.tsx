import { cn } from "@/lib/utils";

interface BarChartProps {
  data: number[];
  labels?: string[];
  className?: string;
  /** Index to highlight, e.g. the current period. Defaults to the last bar. */
  highlightIndex?: number;
}

/* Vertical bars as flex children rather than SVG — keeps hover affordances and
   tooltips as ordinary DOM, and scales cleanly without stroke artefacts. */
function BarChart({ data, labels, className, highlightIndex }: BarChartProps) {
  const max = Math.max(...data) || 1;
  const highlight = highlightIndex ?? data.length - 1;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-1 items-end gap-1.5">
        {data.map((value, i) => {
          const isHighlight = i === highlight;
          return (
            <div
              key={i}
              className="group/bar relative flex flex-1 items-end justify-center"
              style={{ height: "100%" }}
            >
              <div
                style={{ height: `${Math.max((value / max) * 100, 2)}%` }}
                className={cn(
                  "w-full rounded-t-sm transition-all duration-300 ease-premium",
                  isHighlight
                    ? "bg-gradient-to-t from-electric-700/50 to-electric-400"
                    : "bg-gradient-to-t from-electric-800/40 to-electric-600/70 group-hover/bar:to-electric-500"
                )}
              />
              {/* Value on hover — no JS, pure CSS reveal. */}
              <span className="pointer-events-none absolute -top-6 rounded-sm border border-line bg-surface-elevated px-1.5 py-0.5 font-mono text-[0.625rem] text-content opacity-0 shadow-raised transition-opacity duration-200 group-hover/bar:opacity-100">
                {value}
              </span>
            </div>
          );
        })}
      </div>

      {labels && (
        <div className="mt-2.5 flex gap-1.5">
          {labels.map((label) => (
            <span
              key={label}
              className="flex-1 text-center text-[0.625rem] tabular-nums text-content-disabled"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { BarChart };
