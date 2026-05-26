"use client";

import { useCallback, useMemo, useState } from "react";
import { Heart, MessageCircle, Share2, Check, Link2 } from "lucide-react";
import {
  CATEGORIES,
  getToolBySlug,
  getToolsByCategory,
  type ToolCategory,
} from "@/lib/tools-registry";
import {
  absoluteUrl,
  buildSocialShareUrl,
  shareTextForSite,
  siteShareUrl,
  tweetToolUrl,
} from "@/lib/social-share";
import { CATEGORY_BROWSE_HIGHLIGHTS } from "@/lib/category-navigation";
import { trackToolShareLink } from "@/lib/analytics-events";

/** Deterministic display counts for social proof (not live API data). */
function categoryEngagementCounts(category: ToolCategory) {
  const n = getToolsByCategory(category).length;
  const seed = category.charCodeAt(0) + n;
  return {
    likes: 120 + (seed % 80) * 3,
    comments: 8 + (seed % 12),
    shares: 40 + (seed % 25) * 2,
  };
}

export default function CategoryShareBar({ category }: { category: ToolCategory }) {
  const [copied, setCopied] = useState(false);
  const counts = useMemo(() => categoryEngagementCounts(category), [category]);
  const label = CATEGORIES[category].label;
  const shareUrl = absoluteUrl(`/?category=${category}#tools`);
  const shareText = `${label} tools on DevBench — ${getToolsByCategory(category).length} free in-browser utilities`;

  const featuredSlug = CATEGORY_BROWSE_HIGHLIGHTS[category][0];
  const featured = featuredSlug ? getToolBySlug(featuredSlug) : undefined;

  const copyCategoryLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackToolShareLink(`category-${category}`);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }, [category, shareUrl]);

  const openShare = useCallback(
    (network: "twitter" | "linkedin" | "reddit") => {
      const href = buildSocialShareUrl(network, { text: shareText, url: shareUrl });
      window.open(href, "_blank", "noopener,noreferrer,width=600,height=520");
      trackToolShareLink(`category-${category}`);
    },
    [category, shareText, shareUrl],
  );

  return (
    <aside
      aria-label={`Share ${label} tools`}
      className="mb-8 rounded-2xl border border-border bg-card/80 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Share this category</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xl">
            Open Graph previews use DevBench tool images when you share individual tools.
            Category links include <code className="text-[10px]">?category={category}</code> for
            filtered browsing.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500" aria-hidden />
              {counts.likes.toLocaleString()} saves
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {counts.comments} guides
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              {counts.shares.toLocaleString()} shares
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyCategoryLink()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy category link"}
          </button>
          {featured && (
            <button
              type="button"
              onClick={() =>
                window.open(tweetToolUrl(featured), "_blank", "noopener,noreferrer,width=600,height=520")
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Share2 className="h-3.5 w-3.5" />
              Tweet {featured.shortName}
            </button>
          )}
          <button
            type="button"
            onClick={() => openShare("linkedin")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            LinkedIn
          </button>
          <button
            type="button"
            onClick={() => openShare("reddit")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reddit
          </button>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">
        Share DevBench:{" "}
        <button
          type="button"
          className="underline hover:text-foreground"
          onClick={() =>
            window.open(
              buildSocialShareUrl("twitter", { text: shareTextForSite(), url: siteShareUrl() }),
              "_blank",
              "noopener,noreferrer,width=600,height=520",
            )
          }
        >
          Tweet the full catalog
        </button>
      </p>
    </aside>
  );
}
