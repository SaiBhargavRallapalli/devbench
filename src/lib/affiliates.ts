// Copyright (c) 2026 DevBench contributors. MIT License.

/**
 * Affiliate / referral program registry.
 *
 * ## How to start earning
 * Replace each `href` below with your own tracked referral URL (e.g.
 * `https://vercel.com/?ref=devbench`). Every entry ships with the plain
 * product URL so links are useful and safe to ship *before* you have referral
 * codes — swapping in your link is the only step required to monetise.
 *
 * ## Compliance (do not skip)
 * - Every link with `isAffiliate: true` renders with
 *   `rel="sponsored nofollow noopener noreferrer"`. Google's webmaster
 *   guidelines require the `sponsored` relationship for paid/affiliate links;
 *   omitting it risks the AdSense account that powers site revenue.
 * - `AFFILIATE_DISCLOSURE` is shown adjacent to the links and summarised in
 *   the site privacy policy (FTC endorsement-guide requirement).
 *
 * These are deliberately *not* ad slots — they are editorial recommendations,
 * which monetise far better than display ads for a developer audience.
 */

export type AffiliateCategory = "hosting" | "domains" | "learning" | "tooling";

export type AffiliateProgram = {
  /** Stable id — used as the React key and for analytics event labels. */
  id: string;
  name: string;
  /** One-line, non-hyperbolic reason this is worth a developer's attention. */
  blurb: string;
  /**
   * Destination URL. Replace with your referral link to earn.
   * Left as the plain product URL until then — `isAffiliate` stays true so the
   * `sponsored` rel is already correct the moment you swap the URL in.
   */
  href: string;
  /** Whether this href is (or will be) a tracked referral link. */
  isAffiliate: boolean;
  category: AffiliateCategory;
};

/**
 * Master switch for showing affiliate recommendations.
 *
 * Currently OFF: the `href`s below are still placeholder referral URLs (they
 * earn $0), so the cards are hidden across every surface (home, tool pages,
 * blog) rather than shown as dead links. Flip this to `true` once real tracked
 * referral URLs are in place — nothing else needs to change.
 */
export const AFFILIATE_ENABLED = false;

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: "vercel",
    name: "Vercel",
    blurb: "Deploy frontend apps with zero config — what DevBench itself runs on.",
    href: "https://vercel.com/?ref=devbench",
    isAffiliate: true,
    category: "hosting",
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    blurb: "Straightforward VPS and app hosting with predictable pricing.",
    href: "https://www.digitalocean.com/?refcode=devbench",
    isAffiliate: true,
    category: "hosting",
  },
  {
    id: "namecheap",
    name: "Namecheap",
    blurb: "Low-cost domain registration with free WHOIS privacy.",
    href: "https://www.namecheap.com/?aff=devbench",
    isAffiliate: true,
    category: "domains",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    blurb: "AI pair-programming that autocomplete the boilerplate you'd otherwise write.",
    href: "https://github.com/features/copilot?aff=devbench",
    isAffiliate: true,
    category: "tooling",
  },
];

/** FTC / Google endorsement disclosure shown next to affiliate links. */
export const AFFILIATE_DISCLOSURE =
  "Some links on this page are affiliate links. If you sign up, DevBench may earn a " +
  "commission at no extra cost to you. We only list products we'd use ourselves — and " +
  "every DevBench tool stays free.";

/**
 * Builds the `rel` attribute for an external link.
 *
 * - Affiliate links always get `sponsored nofollow` (Google requirement).
 * - Non-affiliate external links get `nofollow` only.
 * - `noopener noreferrer` is always included for `target="_blank"` safety.
 */
export function affiliateRel(isAffiliate: boolean): string {
  const relationships = isAffiliate
    ? ["sponsored", "nofollow", "noopener", "noreferrer"]
    : ["nofollow", "noopener", "noreferrer"];
  return relationships.join(" ");
}

/** Programs for a given category, or all programs when category is omitted. */
export function getAffiliatePrograms(category?: AffiliateCategory): AffiliateProgram[] {
  // Hidden while AFFILIATE_ENABLED is false — AffiliateRecommendations renders
  // nothing when this returns empty, so every surface hides at once.
  if (!AFFILIATE_ENABLED) return [];
  return category
    ? AFFILIATE_PROGRAMS.filter((p) => p.category === category)
    : AFFILIATE_PROGRAMS;
}
