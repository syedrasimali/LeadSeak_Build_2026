"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

const columns = [
  {
    heading: "Platform",
    links: [
      { label: "Prospect Discovery", href: "#features" },
      { label: "Campaign Targeting", href: "#features" },
      { label: "Lead Intelligence", href: "#features" },
      { label: "CRM", href: "#features" },
      { label: "Analytics", href: "#features" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Documentation", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Legals",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Data Processing", href: "#" },
    ],
  },
];

function SiteFooter() {
  const footerRef = React.useRef<HTMLElement>(null);
  const colsRef = React.useRef<HTMLElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !footerRef.current) return;
    registerGSAP();

    const cols = colsRef.current.filter(Boolean);
    if (!cols.length) return;

    gsap.fromTo(
      cols,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: motionTiming.normal,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(cols);
    };
  }, [reduced, hasAnimated]);

  return (
    <footer
      ref={footerRef}
      className="relative border-t border-line bg-canvas-subtle"
    >
      {/* Grid background on contact card area */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 20%, #000 80%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand column */}
          <div
            ref={(el) => {
              if (el) colsRef.current[0] = el;
            }}
            style={{ opacity: reduced ? 1 : undefined }}
            className="flex flex-col gap-4"
          >
            <Link
              href="/"
              aria-label="LeadSeak home"
              className="w-fit rounded-md transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-500"
            >
              <Logo className="logo-entrance" />
            </Link>
            <p className="max-w-xs text-small text-content-secondary leading-relaxed">
              AI-powered prospect discovery, lead intelligence, and CRM for
              teams that own their pipeline end to end.
            </p>

            {/* Contact card */}
            <div className="mt-2 rounded-xl border border-line bg-surface/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-electric-500/20">
              <p className="text-caption font-medium text-content">
                Get in touch
              </p>
              <p className="mt-1 text-caption text-content-secondary">
                alisyedrasim@gmail.com
              </p>
              <div className="mt-3 flex gap-3">
                <a
                  href="https://x.com/jaffery_for"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="grid size-8 place-items-center rounded-lg border border-line bg-canvas-subtle text-content-muted transition-all duration-200 hover:border-electric-500/24 hover:text-electric-400 hover:float-animation"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/syed-rasim-ali-329a77354/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="grid size-8 place-items-center rounded-lg border border-line bg-canvas-subtle text-content-muted transition-all duration-200 hover:border-electric-500/24 hover:text-electric-400 hover:float-animation"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/syedrasimali"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="grid size-8 place-items-center rounded-lg border border-line bg-canvas-subtle text-content-muted transition-all duration-200 hover:border-electric-500/24 hover:text-electric-400 hover:float-animation"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((column, i) => (
            <nav
              key={column.heading}
              ref={(el) => {
                if (el) colsRef.current[i + 1] = el;
              }}
              style={{ opacity: reduced ? 1 : undefined }}
              aria-label={column.heading}
            >
              <p className="text-overline uppercase text-content-muted">
                {column.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-small text-content-secondary transition-all duration-200 hover:text-content hover:translate-x-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-content-muted">
            &copy; {new Date().getFullYear()} LeadSeak. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-caption text-content-secondary transition-all duration-200 hover:text-content"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-caption text-content-secondary transition-all duration-200 hover:text-content"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };
