import { cn } from "@/lib/utils";

interface AreaChartProps {
  data: number[];
  labels?: string[];
  className?: string;
  /** Unique id — required so multiple gradients on one page do not collide. */
  gradientId: string;
  showGrid?: boolean;
}

/* Lightweight SVG area chart. Rendered server-side with no charting library:
   the path is computed from the series and scaled by viewBox, and strokes use
   non-scaling-stroke so they stay 1px crisp at any container width. */
function AreaChart({
  data,
  labels,
  className,
  gradientId,
  showGrid = true,
}: AreaChartProps) {
  const width = 100;
  const height = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  // Leave headroom so the peak never touches the top edge.
  const pad = 3;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - pad - ((value - min) / span) * (height - pad * 2);
    return { x, y };
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-electric-400)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--color-electric-500)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid &&
          [0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={width}
              y1={height * ratio}
              y2={height * ratio}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--color-electric-400)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Emphasise the latest reading. */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="1.6"
          fill="var(--color-electric-300)"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {labels && (
        <div className="mt-2 flex justify-between">
          {labels.map((label, i) => (
            <span
              key={label}
              className="min-w-0 truncate text-[0.625rem] tabular-nums text-content-disabled max-sm:[&:nth-child(even)]:hidden"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { AreaChart };
