"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useCommandMenu } from "@/components/dashboard/command-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

const ThreeBackground = dynamic(
  () => import("@/components/three-background").then((m) => m.ThreeBackground),
  { ssr: false, loading: () => null }
);

const CommandMenu = dynamic(
  () => import("@/components/dashboard/command-menu").then((m) => m.CommandMenu),
  { ssr: false }
);

function DashboardShell({ children, leadCount }: { children: React.ReactNode; leadCount: number }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const commandMenu = useCommandMenu();
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (reduced || !mobileOpen) return;
    registerGSAP();

    const drawer = drawerRef.current;
    const overlay = overlayRef.current;
    if (!drawer || !overlay) return;

    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: motionTiming.normal, ease: "power3.out" }
    );

    gsap.fromTo(
      drawer,
      { x: "-100%" },
      { x: "0%", duration: motionTiming.cinematic, ease: "power4.out" }
    );

    return () => {
      gsap.killTweensOf([drawer, overlay]);
    };
  }, [mobileOpen, reduced]);

  const showEntrance = !reduced && mounted;

  return (
    <TooltipProvider delayDuration={260}>
      <div className="relative flex min-h-screen">
        {/* Background layers — Three.js + CSS effects */}
        <div className="dash-bg-layers" aria-hidden>
          <div className="field-electric" />
          <div className="grid-technical mask-fade-b" />
          <ThreeBackground />
        </div>

        {/* Persistent sidebar — desktop only. */}
        <aside className="relative z-10 hidden w-64 shrink-0 border-r border-line bg-canvas/40 backdrop-blur-sm lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar leadCount={leadCount} />
          </div>
        </aside>

        {/* Drawer sidebar — mobile and tablet. */}
        <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay
              ref={overlayRef}
              className="fixed inset-0 z-40 bg-[#020306]/80 backdrop-blur-[2px] data-[state=open]:animate-fade-in lg:hidden"
            />
            <DialogPrimitive.Content
              ref={drawerRef}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[82vw] border-r border-line shadow-overlay data-[state=open]:animate-fade-in lg:hidden"
            >
              <DialogPrimitive.Title className="sr-only">
                Navigation
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close navigation"
                className="absolute right-3 top-4 grid size-8 place-items-center rounded-md text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content"
              >
                <X className="size-4" />
              </DialogPrimitive.Close>
              <Sidebar leadCount={leadCount} onNavigate={() => setMobileOpen(false)} />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        <div className={showEntrance ? "dash-entrance flex min-w-0 flex-1 flex-col" : "flex min-w-0 flex-1 flex-col"}>
          <div className="dash-el-topbar">
            <Topbar onOpenSidebar={() => setMobileOpen(true)} onOpenCommandMenu={() => commandMenu.onOpenChange(true)} />
          </div>
          <main
            id="main-content"
            className="dash-el-main relative z-10 flex-1 px-4 py-5 sm:px-6 sm:py-6"
          >
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>

      <CommandMenu {...commandMenu} />
    </TooltipProvider>
  );
}

export { DashboardShell };
