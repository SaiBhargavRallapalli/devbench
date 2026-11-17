// Copyright (c) 2026 DevBench contributors. MIT License.
import Link from "next/link";

/**
 * Sitewide affiliate disclosure strip.
 *
 * Rendered at the top of every page from the root layout so the notice appears
 * in server-rendered HTML on any page that carries (or will carry) affiliate
 * links. The wording is exactly what DigitalOcean's affiliate manager (Awin)
 * requires for approval: a single sitewide notice with this phrasing means
 * individual links do not each need their own label. It also matches the FTC
 * "clear and conspicuous" standard. The full policy lives at /disclosure.
 *
 * Deliberately one slim line: visible to a visitor and a reviewer, but out of
 * the way of the tools themselves.
 */
export default function AffiliateDisclosureBar() {
  return (
    <p className="affiliate-disclosure-bar border-b border-border bg-muted/40 px-4 py-1.5 text-center text-[11px] leading-snug text-muted-foreground">
      We earn commissions, at no additional cost to you, when you shop through
      the links below.{" "}
      <Link
        href="/disclosure"
        className="underline underline-offset-2 transition-colors hover:text-foreground"
      >
        Learn more
      </Link>
    </p>
  );
}
