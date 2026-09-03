"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerGSAP() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function useGSAPContext(
  scope: React.RefObject<HTMLElement | null>,
  enabled = true
) {
  const reduced = useReducedMotion();
  const disabled = reduced || !enabled;

  React.useEffect(() => {
    if (disabled || !scope.current) return;
    registerGSAP();
    const ctx = gsap.context(() => {}, scope.current);
    return () => ctx.revert();
  }, [scope, disabled]);

  return { disabled };
}

export const motionPresets = {
  fadeUp: {
    y: 40,
    opacity: 0,
    ease: "power4.out",
  },
  fadeIn: {
    opacity: 0,
    ease: "power3.out",
  },
  scaleIn: {
    scale: 0.88,
    opacity: 0,
    ease: "power4.out",
  },
  slideInRight: {
    x: 50,
    opacity: 0,
    ease: "power4.out",
  },
  slideInLeft: {
    x: -50,
    opacity: 0,
    ease: "power4.out",
  },
} as const;

export const motionTiming = {
  fast: 0.5,
  normal: 0.7,
  slow: 0.9,
  cinematic: 1.2,
} as const;

export function animateReveal(
  elements: gsap.TweenTarget,
  options: {
    stagger?: number;
    delay?: number;
    duration?: number;
    scrollTrigger?: boolean | object;
    y?: number;
    x?: number;
    scale?: number;
  } = {}
): gsap.core.Tween | gsap.core.Timeline {
  const {
    stagger = 0,
    delay = 0,
    duration = motionTiming.normal,
    scrollTrigger = false,
    y = 40,
    x = 0,
    scale,
  } = options;

  const fromVars: gsap.TweenVars = {
    opacity: 0,
    y,
    x,
    ease: "power4.out",
    duration,
    delay,
  };

  if (scale !== undefined) fromVars.scale = scale;

  if (stagger > 0) fromVars.stagger = stagger;

  if (scrollTrigger) {
    fromVars.scrollTrigger =
      typeof scrollTrigger === "object"
        ? scrollTrigger
        : {
            start: "top 88%",
            end: "top 40%",
            toggleActions: "play none none none",
          };
  }

  return gsap.from(elements, fromVars);
}

export function animateCounter(
  element: gsap.TweenTarget,
  target: number,
  options: {
    duration?: number;
    delay?: number;
    format?: (value: number) => string;
  } = {}
): gsap.core.Tween {
  const { duration = motionTiming.slow, delay = 0, format } = options;
  const el = gsap.utils.toArray<HTMLElement>(element)[0];
  if (!el) return gsap.to(element, {});

  const obj = { value: 0 };
  return gsap.to(obj, {
    value: target,
    duration,
    delay,
    ease: "power2.out",
    onUpdate() {
      const formatted = format
        ? format(Math.round(obj.value))
        : Math.round(obj.value).toLocaleString();
      el.textContent = formatted;
    },
  });
}
