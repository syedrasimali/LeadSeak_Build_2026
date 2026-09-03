"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { registerGSAP, useReducedMotion } from "@/lib/motion";
import gsap from "gsap";

function LogoMark({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced || !ref.current) return;
    registerGSAP();

    const el = ref.current;
    const onEnter = () => {
      gsap.to(el, {
        scale: 1.08,
        duration: 0.35,
        ease: "power2.out",
      });
      gsap.to(el, {
        filter: "drop-shadow(0 0 12px rgba(99,130,255,0.45))",
        duration: 0.35,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.to(el, {
        filter: "drop-shadow(0 0 0px rgba(99,130,255,0))",
        duration: 0.3,
        ease: "power2.inOut",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={cn("relative size-8 shrink-0", className)}
    >
      <Image
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        className="size-full object-contain"
        priority
      />
    </div>
  );
}

function Logo({
  className,
  showWordmark = true,
  size = "default",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const wordmarkRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const sizeClasses = {
    sm: "gap-2",
    default: "gap-2.5",
    lg: "gap-3",
  };

  const textClasses = {
    sm: "text-small",
    default: "text-body",
    lg: "text-h4",
  };

  const markSizes = {
    sm: "size-6",
    default: "size-8",
    lg: "size-10",
  };

  React.useEffect(() => {
    if (reduced || !wordmarkRef.current) return;
    registerGSAP();

    const el = wordmarkRef.current;
    const onEnter = () => {
      gsap.to(el.querySelector(".logo-seak"), {
        color: "#8ba4ff",
        duration: 0.3,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to(el.querySelector(".logo-seak"), {
        color: "#648eff",
        duration: 0.3,
        ease: "power2.inOut",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [reduced]);

  return (
    <span
      className={cn(
        "inline-flex items-center",
        sizeClasses[size],
        className
      )}
    >
      <LogoMark className={markSizes[size]} />
      {showWordmark && (
        <span
          ref={wordmarkRef}
          className={cn(
            textClasses[size],
            "font-semibold tracking-[-0.02em] text-content"
          )}
        >
          Lead<span className="logo-seak text-electric-400">Seak</span>
        </span>
      )}
    </span>
  );
}

export { Logo, LogoMark };
