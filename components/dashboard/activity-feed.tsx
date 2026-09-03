"use client";

import * as React from "react";
import {
  Flame,
  MailOpen,
  MoveRight,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { demoActivity, type DemoActivity } from "@/lib/demo-data";
import { registerGSAP, useReducedMotion } from "@/lib/motion";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const kindConfig: Record<
  DemoActivity["kind"],
  { icon: LucideIcon; className: string }
> = {
  discovery: {
    icon: Sparkles,
    className: "border-electric-500/26 bg-electric-500/12 text-electric-300",
  },
  score: {
    icon: Flame,
    className: "border-danger/26 bg-danger/12 text-danger-soft",
  },
  reply: {
    icon: MailOpen,
    className: "border-success/26 bg-success/12 text-success-soft",
  },
  stage: {
    icon: MoveRight,
    className: "border-indigo-blue-500/26 bg-indigo-blue-500/12 text-indigo-blue-300",
  },
  campaign: {
    icon: Target,
    className: "border-warning/26 bg-warning/12 text-warning-soft",
  },
};

function ActivityFeed() {
  const listRef = React.useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !listRef.current) return;
    registerGSAP();

    const items = listRef.current.querySelectorAll("li");
    if (!items.length) return;

    gsap.fromTo(
      items,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(items);
    };
  }, [reduced, hasAnimated]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated transition-shadow duration-300 hover:shadow-[0_0_24px_-8px_rgba(52,120,255,0.08)]">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-body font-semibold text-content">Activity</h2>
        <p className="mt-0.5 text-caption text-content-muted">
          Latest workspace events
        </p>
      </div>

      <ol
        ref={listRef}
        className="relative flex flex-1 flex-col gap-0 p-5"
      >
        {demoActivity.map((event, i) => {
          const { icon: Icon, className } = kindConfig[event.kind];
          const isLast = i === demoActivity.length - 1;

          return (
            <li
              key={event.id}
              className="relative flex gap-3 pb-5 last:pb-0 transition-colors duration-200 rounded-md px-2 -mx-2 hover:bg-white/[0.02]"
              style={reduced ? undefined : { opacity: 0 }}
            >
              {/* Timeline rail */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[0.9375rem] top-8 h-[calc(100%-1rem)] w-px bg-line"
                />
              )}

              <span
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border transition-transform duration-200 hover:scale-110",
                  className
                )}
              >
                <Icon className="size-3.5" />
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-small font-medium text-content">
                  {event.title}
                </p>
                <p className="mt-0.5 text-caption text-content-secondary">
                  {event.detail}
                </p>
                <p className="mt-1 font-mono text-[0.625rem] text-content-disabled">
                  {event.at}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export { ActivityFeed };
