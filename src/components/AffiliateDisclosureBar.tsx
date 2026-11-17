// Copyright (c) 2026 DevBench contributors. MIT License.
import Link from "next/link";

/**
 * Sitewide affiliate disclosure strip.
 *
 * Rendered at the top of every page from the root layout so the notice appears
 * in server-rendered HTML on any page that carries (or will carry) affiliate
 * links. This is the placement affiliate programs (e.g. DigitalOcean via Awin)
 * verify before approval, and matches the FTC "clear and conspicuous" standard
 * for endorsement disclosures. The full policy lives at /disclosure.
 *
 * Deliberately one slim line: visible to a visitor and a reviewer, but out of
 * the way of the tools themselves.
 */
export default function AffiliateDisclosureBar() {
  return (
    <p className="affiliate-disclosure-bar border-b border-border bg-muted/40 px-4 py-1.5 text-center text-[11px] leading-snug text-muted-foreground">
      Some links on DevBench are affiliate links - we may earn a commission when
      you shop through them, at no extra cost to you.{" "}
      <Link
        href="/disclosure"
        className="underline underline-offset-2 transition-colors hover:text-foreground"
      >
        Learn more
      </Link>
    </p>
  );
}
