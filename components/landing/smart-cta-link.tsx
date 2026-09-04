"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SmartCtaLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  fallbackHref?: string;
}

export const SmartCtaLink = React.forwardRef<HTMLAnchorElement, SmartCtaLinkProps>(
  function SmartCtaLink(
    { href = "/dashboard", fallbackHref = "/signup", children, ...props },
    ref
  ) {
    const [targetHref, setTargetHref] = React.useState(fallbackHref);

    React.useEffect(() => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setTargetHref(user ? href : fallbackHref);
      });
    }, [href, fallbackHref]);

    return (
      <Link ref={ref} href={targetHref} {...props}>
        {children}
      </Link>
    );
  }
);
