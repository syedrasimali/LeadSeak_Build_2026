"use client";

import * as React from "react";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

function MotionGrid({
  children,
  className,
  stagger = 0.08,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();

    const cards = containerRef.current.children;
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: motionTiming.normal,
        stagger,
        ease: "back.out(1.4)",
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(cards);
    };
  }, [reduced, hasAnimated, stagger, y]);

  return (
    <div ref={containerRef} className={className} style={reduced ? undefined : { opacity: 1 }}>
      {children}
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: motionTiming.normal,
        ease: "power3.out",
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(containerRef.current);
    };
  }, [reduced, hasAnimated]);

  return <div ref={containerRef}>{children}</div>;
}

export { MotionGrid, PageTransition };
