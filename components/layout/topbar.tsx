"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Check, Menu, Plus, Search } from "lucide-react";
import { AccountMenu } from "@/components/layout/account-menu";
import { CampaignFormDialog } from "@/components/dashboard/create-campaign-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { primaryNav, secondaryNav } from "@/lib/navigation";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import { getRecentNotifications, type NotificationItem } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import gsap from "gsap";

function currentTitle(pathname: string): string {
  const match = [...primaryNav, ...secondaryNav]
    .filter((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return match?.label ?? "Dashboard";
}

const kindStyles: Record<string, string> = {
  discovery: "border-electric-500/26 bg-electric-500/12 text-electric-300",
  score: "border-danger/26 bg-danger/12 text-danger-soft",
  reply: "border-success/26 bg-success/12 text-success-soft",
  stage: "border-indigo-blue-500/26 bg-indigo-blue-500/12 text-indigo-blue-300",
  campaign: "border-warning/26 bg-warning/12 text-warning-soft",
  lead: "border-electric-500/26 bg-electric-500/12 text-electric-300",
  export: "border-line-strong/26 bg-white/[0.04] text-content-muted",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    getRecentNotifications().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  function markRead(id: string) {
    setReadIds((prev) => new Set(prev).add(id));
  }

  function markAllRead() {
    setReadIds(new Set(items.map((i) => i.id)));
  }

  if (!open) return null;

  const unreadCount = items.filter((i) => !readIds.has(i.id)).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-xl border border-line bg-surface-elevated shadow-overlay animate-in fade-in-0 zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h3 className="text-small font-semibold text-content">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-[0.625rem] text-content-muted">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-caption font-medium text-electric-400 hover:text-electric-300"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-5 animate-spin rounded-full border-2 border-electric-500 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="mx-auto mb-2 size-5 text-content-muted" />
            <p className="text-caption text-content-muted">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-2">
            {items.map((item) => {
              const isRead = readIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => markRead(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    "hover:bg-white/[0.04]",
                    !isRead && "bg-electric-500/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border",
                      kindStyles[item.kind] ?? kindStyles.discovery
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-small truncate", isRead ? "text-content-secondary" : "font-medium text-content")}>
                      {item.title}
                    </p>
                    {item.detail && (
                      <p className="mt-0.5 text-caption text-content-muted truncate">
                        {item.detail}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-[0.625rem] text-content-disabled">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </div>
                  {!isRead && (
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-electric-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-line px-4 py-2.5">
          <button
            onClick={() => {
              onClose();
              window.location.href = "/dashboard";
            }}
            className="text-caption font-medium text-electric-400 hover:text-electric-300"
          >
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}

function Topbar({ onOpenSidebar, onOpenCommandMenu }: { onOpenSidebar: () => void; onOpenCommandMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const prevPath = React.useRef(pathname);
  const [mounted, setMounted] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (reduced || !titleRef.current) return;
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    registerGSAP();
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: motionTiming.fast, ease: "power3.out" }
    );
  }, [pathname, reduced]);

  const title = currentTitle(pathname);
  const showEntrance = !reduced && mounted;

  return (
    <header
      className="sticky top-0 z-30 flex h-15 shrink-0 items-center gap-3 border-b border-line bg-canvas/60 px-4 backdrop-blur-2xl sm:px-6"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="lg:hidden"
      >
        <Menu />
      </Button>

      <h1
        ref={titleRef}
        className="truncate text-body font-semibold tracking-[-0.015em] text-content lg:text-h3"
      >
        {title}
      </h1>

      <div
        ref={actionsRef}
        className={showEntrance ? "dash-topbar-entrance ml-auto flex items-center gap-2" : "ml-auto flex items-center gap-2"}
      >
        {/* Search — clicking opens the command menu */}
        <div className="dash-tb-actions hidden md:block md:w-56 lg:w-72">
          <Input
            type="search"
            placeholder="Search prospects…"
            leadingIcon={<Search />}
            trailingSlot={
              <kbd className="rounded border border-line bg-canvas-subtle px-1.5 py-0.5 font-mono text-[0.625rem] text-content-muted">
                ⌘K
              </kbd>
            }
            className="pr-16 cursor-pointer"
            readOnly
            onClick={onOpenCommandMenu}
          />
        </div>
        <Tooltip content="Search">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search"
            className="dash-tb-actions md:hidden"
            onClick={onOpenCommandMenu}
          >
            <Search />
          </Button>
        </Tooltip>

        {/* Notifications */}
        <div className="dash-tb-actions relative">
          <Tooltip content="Notifications">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((v) => !v)}
            >
              <span className="relative">
                <Bell />
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-electric-400 ring-2 ring-canvas animate-pulse"
                />
              </span>
            </Button>
          </Tooltip>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <Button size="sm" className="dash-tb-actions hidden sm:inline-flex shimmer-btn" onClick={() => setCreateOpen(true)}>
          <Plus />
          New campaign
        </Button>
        <Button size="icon-sm" aria-label="New campaign" className="dash-tb-actions sm:hidden" onClick={() => setCreateOpen(true)}>
          <Plus />
        </Button>

        <div className="dash-tb-actions">
          <AccountMenu />
        </div>
      </div>

      <CampaignFormDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) router.refresh();
        }}
      />
    </header>
  );
}

export { Topbar };
