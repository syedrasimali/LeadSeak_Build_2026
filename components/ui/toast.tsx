"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      gap={10}
      offset={20}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            "group flex w-full items-start gap-3 rounded-lg border border-line",
            "bg-surface-elevated p-4 shadow-overlay",
            "font-sans text-small text-content",
          ].join(" "),
          title: "text-small font-medium text-content",
          description: "mt-0.5 text-caption text-content-secondary",
          actionButton:
            "ml-auto shrink-0 rounded-sm bg-electric-500 px-2.5 py-1 text-caption font-medium text-white transition-colors hover:bg-electric-400",
          cancelButton:
            "shrink-0 rounded-sm border border-line px-2.5 py-1 text-caption font-medium text-content-secondary transition-colors hover:bg-white/[0.05]",
          closeButton:
            "border-line bg-surface-elevated text-content-muted hover:text-content",
          icon: "shrink-0 [&_svg]:size-4",
          success: "[&_[data-icon]]:text-success-soft",
          warning: "[&_[data-icon]]:text-warning-soft",
          error: "[&_[data-icon]]:text-danger-soft",
          info: "[&_[data-icon]]:text-electric-400",
        },
      }}
    />
  );
}

export { Toaster, toast };
