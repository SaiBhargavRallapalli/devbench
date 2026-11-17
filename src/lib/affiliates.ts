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
  /**
   * Whether this program shows on the site. True only when `href` is the
   * program's real tracked referral link (placeholder URLs earn $0 and stay
   * hidden).
   */
  live: boolean;
};

/**
 * Master switch for showing affiliate recommendations.
 *
 * ON: DigitalOcean (below) carries its real Awin tracking link, so the
 * recommendation cards show. Other programs stay hidden via `live: false`
 * until their real tracked URLs are in place.
 */
export const AFFILIATE_ENABLED = true;

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: "vercel",
    name: "Vercel",
    blurb: "Deploy frontend apps with zero config — what DevBench itself runs on.",
    href: "https://vercel.com/?ref=devbench",
    isAffiliate: true,
    category: "hosting",
    live: false,
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    blurb: "Straightforward VPS and app hosting with predictable pricing.",
    // Real Awin tracking link (publisher 3157348, advertiser 123996),
    // generated in the Awin Link Builder and approved by DigitalOcean.
    href: "https://www.awin1.com/cread.php?awinmid=123996&awinaffid=3157348&ued=https%3A%2F%2Fwww.digitalocean.com%2F",
    isAffiliate: true,
    category: "hosting",
    live: true,
  },
  {
    id: "namecheap",
    name: "Namecheap",
    blurb: "Low-cost domain registration with free WHOIS privacy.",
    href: "https://www.namecheap.com/?aff=devbench",
    isAffiliate: true,
    category: "domains",
    live: false,
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    blurb: "AI pair-programming that autocomplete the boilerplate you'd otherwise write.",
    href: "https://github.com/features/copilot?aff=devbench",
    isAffiliate: true,
    category: "tooling",
    live: false,
  },
];

/**
 * FTC / Google endorsement disclosure shown next to affiliate links.
 * Leads with the exact wording DigitalOcean's affiliate manager (Awin)
 * requires for approval, so one disclosure covers every link it sits above.
 */
export const AFFILIATE_DISCLOSURE =
  "These are affiliate links: we earn commissions, at no additional cost to you, " +
  "when you shop through the links below. We only list products we'd use " +
  "ourselves - and every DevBench tool stays free.";

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
  // Only programs with a real tracked referral link (`live`) are shown;
  // placeholder URLs stay hidden even when the master switch is on.
  const live = AFFILIATE_PROGRAMS.filter((p) => p.live);
  return category ? live.filter((p) => p.category === category) : live;
}
