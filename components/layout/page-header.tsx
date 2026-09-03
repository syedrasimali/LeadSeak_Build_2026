"use client";

import * as React from "react";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

function PageHeader({
  className,
  title,
  description,
  actions,
  eyebrow,
  ...props
}: PageHeaderProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !ref.current) return;
    registerGSAP();

    const children = ref.current.children;
    if (!children.length) return;

    gsap.fromTo(
      children,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: motionTiming.fast,
        stagger: 0.08,
        ease: "power3.out",
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(children);
    };
  }, [reduced, hasAnimated]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-3 pb-5 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && (
          <p
            className="text-overline uppercase text-electric-400"
            style={reduced ? undefined : { opacity: 0 }}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className="text-h2 text-content"
          style={reduced ? undefined : { opacity: 0 }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="max-w-2xl text-body text-content-secondary"
            style={reduced ? undefined : { opacity: 0 }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div
          className="flex shrink-0 items-center gap-2.5"
          style={reduced ? undefined : { opacity: 0 }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export { PageHeader };
