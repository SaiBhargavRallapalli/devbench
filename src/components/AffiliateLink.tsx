// Copyright (c) 2026 DevBench contributors. MIT License.
"use client";

import { ExternalLink } from "lucide-react";
import { affiliateRel, type AffiliateProgram } from "@/lib/affiliates";

/**
 * External affiliate/referral link.
 *
 * Always renders with `target="_blank"` and a computed `rel`. Affiliate links
 * get `sponsored nofollow` (Google requirement for paid links — protects the
 * AdSense account), so the compliance-critical rel can't be forgotten by
 * callers. New-Tab behaviour is announced to assistive tech.
 */
export default function AffiliateLink({
  program,
  children,
  className,
}: {
  program: AffiliateProgram;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={program.href}
      target="_blank"
      rel={affiliateRel(program.isAffiliate)}
      className={className}
      data-affiliate-program={program.id}
    >
      {children ?? program.name}
      <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3 opacity-50" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
