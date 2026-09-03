import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  compact?: boolean;
}

function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line text-center",
        compact ? "gap-3 px-6 py-10" : "gap-4 px-6 py-16",
        className
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            "grid place-items-center rounded-xl border border-line bg-surface text-content-muted",
            "[&_svg]:size-5",
            compact ? "size-10" : "size-12"
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-body font-medium text-content">{title}</p>
        {description && (
          <p className="text-small text-content-secondary">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-col items-center gap-2.5 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
