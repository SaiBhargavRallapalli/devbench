"use client";

import { useCallback, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import {
  buildSocialShareUrl,
  shareTextForTool,
  toolShareUrl,
  tweetToolUrl,
  type SocialNetwork,
} from "@/lib/social-share";
import { trackToolShareLink } from "@/lib/analytics-events";
import HoverTooltip from "@/components/HoverTooltip";

const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  reddit: "Reddit",
};

export default function ShareToolButton({
  tool,
  compact = false,
}: {
  tool: Tool;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copyLink = useCallback(async () => {
    const url = toolShareUrl(tool);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackToolShareLink(tool.slug);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [tool]);

  const openSocial = useCallback(
    (network: SocialNetwork) => {
      const url = toolShareUrl(tool);
      const text = shareTextForTool(tool);
      const href = buildSocialShareUrl(network, { text, url });
      window.open(href, "_blank", "noopener,noreferrer,width=600,height=520");
      trackToolShareLink(tool.slug);
      setOpen(false);
    },
    [tool],
  );

  const tweetOneClick = useCallback(() => {
    window.open(tweetToolUrl(tool), "_blank", "noopener,noreferrer,width=600,height=520");
    trackToolShareLink(tool.slug);
  }, [tool]);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <HoverTooltip label="Copy tool link for sharing">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" aria-hidden />
            ) : (
              <Link2 className="h-3 w-3" aria-hidden />
            )}
            {copied ? "Copied" : "Copy link"}
          </button>
        </HoverTooltip>
        <HoverTooltip label="Tweet this tool with one click">
          <button
            type="button"
            onClick={tweetOneClick}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Share2 className="h-3 w-3" aria-hidden />
            Tweet
          </button>
        </HoverTooltip>
      </div>
    );
  }

  return (
    <div className="relative">
      <HoverTooltip label="Share tool — copy link or open social">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="true"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Share2 className="h-3 w-3 shrink-0" aria-hidden />
          Share tool
        </button>
      </HoverTooltip>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close share menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-border bg-popover p-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => void copyLink()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
              {copied ? "Link copied" : "Copy tool link"}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={tweetOneClick}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted"
            >
              <Share2 className="h-3.5 w-3.5" />
              Tweet this tool
            </button>
            {(Object.keys(SOCIAL_LABELS) as SocialNetwork[])
              .filter((n) => n !== "twitter")
              .map((network) => (
                <button
                  key={network}
                  type="button"
                  role="menuitem"
                  onClick={() => openSocial(network)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted"
                >
                  {SOCIAL_LABELS[network]}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
