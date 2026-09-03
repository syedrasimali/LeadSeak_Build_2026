import { cn } from "@/lib/utils";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  className?: string;
  centerLabel?: string;
  centerValue?: string;
}

/* SVG donut built from stroke-dasharray offsets. A 42-unit viewBox with r=15.9
   gives a circumference of ~100, so each segment's dash length is simply its
   percentage — no trigonometry needed. */
function DonutChart({
  segments,
  className,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;

  // Precompute dash geometry up front so nothing mutates during render.
  const arcs = segments.reduce<
    { label: string; color: string; dash: number; offset: number }[]
  >((acc, segment) => {
    const previous = acc[acc.length - 1];
    const offset = previous ? previous.offset + previous.dash : 0;
    const dash = (segment.value / total) * circumference;
    acc.push({ label: segment.label, color: segment.color, dash, offset });
    return acc;
  }, []);

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 42 42" className="size-full -rotate-90" role="img" aria-label="Distribution">
        <circle
          cx="21"
          cy="21"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
        />
        {arcs.map((arc) => {
          // Trim each arc slightly so adjacent segments read as separate.
          const visible = Math.max(arc.dash - 1.2, 0);
          return (
            <circle
              key={arc.label}
              cx="21"
              cy="21"
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${visible} ${circumference - visible}`}
              strokeDashoffset={-arc.offset}
            />
          );
        })}
      </svg>

      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="font-mono text-h3 leading-none text-content">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="mt-1 text-[0.625rem] uppercase tracking-wide text-content-muted">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { DonutChart, type DonutSegment };
