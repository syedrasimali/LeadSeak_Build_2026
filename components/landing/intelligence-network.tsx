"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

const IntelligenceNetworkLazy = React.lazy(
  () => import("@/components/landing/intelligence-network-3d")
);

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function IntelligenceNetwork() {
  const reduced = useReducedMotion();
  const [isVisible, setIsVisible] = React.useState(false);
  const [webglSupported, setWebglSupported] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduced) return;
    setWebglSupported(hasWebGL());
  }, [reduced]);

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
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    >
      {webglSupported && isVisible ? (
        <React.Suspense fallback={null}>
          <IntelligenceNetworkLazy />
        </React.Suspense>
      ) : null}
    </div>
  );
}

export { IntelligenceNetwork };
