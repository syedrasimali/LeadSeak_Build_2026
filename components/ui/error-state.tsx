import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  /** Technical detail — shown in a monospace block for debugging. */
  detail?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

function ErrorState({
  className,
  title = "Something went wrong",
  description = "We could not complete that request. Try again in a moment.",
  detail,
  action,
  compact = false,
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-danger/22 bg-danger/[0.045] text-center",
        compact ? "gap-3 px-6 py-10" : "gap-4 px-6 py-16",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "grid place-items-center rounded-xl border border-danger/28 bg-danger/12 text-danger-soft",
          "[&_svg]:size-5",
          compact ? "size-10" : "size-12"
        )}
      >
        <AlertTriangle />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-body font-medium text-content">{title}</p>
        <p className="text-small text-content-secondary">{description}</p>
      </div>
      {detail && (
        <pre className="max-w-full overflow-x-auto rounded-md border border-line bg-canvas-subtle px-3 py-2 text-left font-mono text-caption text-content-muted">
          {detail}
        </pre>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export { ErrorState };
