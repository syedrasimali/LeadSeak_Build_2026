"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Pricing", href: "#pricing" },
];

function LandingNav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 12);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      setScrollProgress(progress);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        aria-hidden
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <header
        data-scrolled={scrolled}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium",
          "border-b border-transparent",
          "data-[scrolled=true]:border-line data-[scrolled=true]:bg-canvas/80 data-[scrolled=true]:backdrop-blur-2xl",
          "data-[scrolled=true]:shadow-[0_1px_0_0_rgba(255,255,255,0.02)]"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-8 px-6 sm:px-10">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            aria-label="LeadSeak home"
            className="shrink-0 rounded-md transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-500"
          >
            <Logo className="logo-entrance" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="magnetic-hover rounded-lg px-3.5 py-2 text-small font-medium text-content-secondary transition-all duration-300 hover:bg-white/[0.05] hover:text-content"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild size="sm" className="glow-border shimmer-btn">
              <Link href="/signup">Start 14-Day Free Trial</Link>
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="md:hidden"
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        <div
          data-open={menuOpen}
          className={cn(
            "overflow-hidden border-t border-line bg-canvas/95 backdrop-blur-2xl transition-[max-height,opacity] duration-500 ease-premium md:hidden",
            "max-h-0 opacity-0 data-[open=true]:max-h-80 data-[open=true]:opacity-100"
          )}
        >
          <nav
            aria-label="Mobile"
            className="flex flex-col gap-1 px-6 pb-6 pt-3 sm:px-10"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-body font-medium text-content-secondary transition-colors duration-200 hover:bg-white/[0.05] hover:text-content"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-md border-t border-line px-3 pt-4 text-body font-medium text-content-secondary transition-colors hover:text-content sm:hidden"
            >
              Log In
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export { LandingNav };
