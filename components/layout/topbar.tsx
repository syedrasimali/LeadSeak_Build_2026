"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { AccountMenu } from "@/components/layout/account-menu";
import { CampaignFormDialog } from "@/components/dashboard/create-campaign-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { primaryNav, secondaryNav } from "@/lib/navigation";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
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

function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const prevPath = React.useRef(pathname);
  const [mounted, setMounted] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Title change animation on route navigation (runs after mount, safe for hydration)
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
        {/* Search collapses to an icon button below md. */}
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
            className="pr-16"
          />
        </div>
        <Tooltip content="Search">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search"
            className="dash-tb-actions md:hidden"
          >
            <Search />
          </Button>
        </Tooltip>

        <Tooltip content="Notifications">
          <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="dash-tb-actions">
            <span className="relative">
              <Bell />
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-electric-400 ring-2 ring-canvas animate-pulse"
              />
            </span>
          </Button>
        </Tooltip>

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
