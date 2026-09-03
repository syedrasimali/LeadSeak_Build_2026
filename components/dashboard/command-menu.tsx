"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FolderPlus,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  action: () => void;
  keywords?: string[];
}

function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = React.useMemo(
    () => [
      {
        id: "dashboard",
        label: "Go to Dashboard",
        description: "Overview and stats",
        icon: LayoutDashboard,
        action: () => router.push("/dashboard"),
        keywords: ["home", "overview"],
      },
      {
        id: "campaigns",
        label: "Go to Campaigns",
        description: "View all campaigns",
        icon: FolderPlus,
        action: () => router.push("/dashboard/campaigns"),
        keywords: ["campaigns", "list"],
      },
      {
        id: "leads",
        label: "Go to Leads",
        description: "View all leads",
        icon: Users,
        action: () => router.push("/dashboard/leads"),
        keywords: ["contacts", "prospects"],
      },
      {
        id: "analytics",
        label: "Go to Analytics",
        description: "Performance metrics",
        icon: BarChart3,
        action: () => router.push("/dashboard/analytics"),
        keywords: ["stats", "metrics", "reports"],
      },
      {
        id: "settings",
        label: "Go to Settings",
        description: "Account preferences",
        icon: Settings,
        action: () => router.push("/dashboard/settings"),
        keywords: ["preferences", "account"],
      },
      {
        id: "new-campaign",
        label: "Create Campaign",
        description: "Start a new campaign",
        icon: FolderPlus,
        action: () => {
          onOpenChange(false);
          router.push("/dashboard/campaigns?new=true");
        },
        keywords: ["new", "add", "create"],
      },
      {
        id: "search-leads",
        label: "Search Leads",
        description: "Find specific leads",
        icon: Search,
        action: () => {
          onOpenChange(false);
          router.push("/dashboard/leads?q=");
        },
        keywords: ["find", "lookup"],
      },
      {
        id: "logout",
        label: "Sign Out",
        description: "End your session",
        icon: LogOut,
        action: () => router.push("/login"),
        keywords: ["signout", "exit"],
      },
    ],
    [router, onOpenChange]
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q))
    );
  }, [query, commands]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = (cmd: CommandItem) => {
    onOpenChange(false);
    cmd.action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="top-[20%] max-w-lg translate-y-0 p-0 sm:top-[25%]"
      >
        <DialogTitle className="sr-only">Command Menu</DialogTitle>

        <div className="relative border-b border-line">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="h-12 border-0 bg-transparent pl-11 pr-4 text-body focus-visible:ring-0"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-small text-content-muted">
              No commands found
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      "hover:bg-white/[0.04] focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-electric-500/40"
                    )}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-canvas-subtle text-content-muted">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-small font-medium text-content truncate">
                        {cmd.label}
                      </span>
                      {cmd.description && (
                        <span className="block text-caption text-content-muted truncate">
                          {cmd.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2">
          <span className="text-caption text-content-muted">
            <kbd className="rounded border border-line bg-canvas-subtle px-1.5 py-0.5 font-mono text-[0.625rem]">
              Esc
            </kbd>{" "}
            to close
          </span>
          <span className="text-caption text-content-muted">
            <kbd className="rounded border border-line bg-canvas-subtle px-1.5 py-0.5 font-mono text-[0.625rem]">
              {typeof navigator !== "undefined" && navigator.platform?.includes("Mac")
                ? "⌘"
                : "Ctrl"}
            </kbd>
            <kbd className="ml-0.5 rounded border border-line bg-canvas-subtle px-1.5 py-0.5 font-mono text-[0.625rem]">
              K
            </kbd>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useCommandMenu() {
  const [open, setOpen] = React.useState(false);
  return { open, onOpenChange: setOpen };
}

export { CommandMenu, useCommandMenu };
