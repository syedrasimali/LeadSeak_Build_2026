"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

const AnimatedBackgroundLazy = React.lazy(
  () => import("@/components/landing/animated-background-3d")
);

function AnimatedBackground() {
  const reduced = useReducedMotion();
  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduced) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {isVisible ? (
        <React.Suspense fallback={null}>
          <AnimatedBackgroundLazy />
        </React.Suspense>
      ) : null}
    </div>
  );
}

export { AnimatedBackground };
