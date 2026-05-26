"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Check,
  ChevronUp,
  Download,
  Gift,
  Link2,
  Share2,
  X,
} from "lucide-react";
import {
  buildSocialShareUrl,
  shareTextForSite,
  siteShareUrl,
} from "@/lib/social-share";
import {
  downloadStarterToolkit,
  isToolkitUnlocked,
  unlockToolkit,
} from "@/lib/starter-toolkit";

const BOOKMARK_HINT_KEY = "devbench:bookmark-hint-shown";

export default function EngagementFloatingCta() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toolkitOpen, setToolkitOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [toolkitUnlocked, setToolkitUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarkDone, setBookmarkDone] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 380);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setToolkitUnlocked(isToolkitUnlocked());
    const onUnlock = () => setToolkitUnlocked(true);
    window.addEventListener("devbench:toolkit-unlocked", onUnlock);
    return () => window.removeEventListener("devbench:toolkit-unlocked", onUnlock);
  }, []);

  const copySiteLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(siteShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }, []);

  const openSocial = useCallback((network: "twitter" | "linkedin" | "reddit") => {
    const href = buildSocialShareUrl(network, {
      text: shareTextForSite(),
      url: siteShareUrl(),
    });
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=520");
    unlockToolkit();
  }, []);

  const handleToolkitEmail = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !email.includes("@")) return;
      unlockToolkit();
      downloadStarterToolkit();
      setToolkitOpen(false);
      setToolkitUnlocked(true);
    },
    [email],
  );

  const handleBookmark = useCallback(() => {
    try {
      localStorage.setItem(BOOKMARK_HINT_KEY, "1");
    } catch {
      /* ignore */
    }
    setBookmarkDone(true);
    // Cannot programmatically bookmark — guide the user
    alert(
      "Press Ctrl+D (Windows) or ⌘+D (Mac) to bookmark DevBench, or use your browser's share menu.",
    );
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Desktop: bottom-right floating stack */}
      <div
        className="fixed bottom-4 right-4 z-50 hidden sm:flex flex-col items-end gap-2 max-w-sm"
        role="complementary"
        aria-label="Engagement actions"
      >
        {expanded && (
          <div className="w-full rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-md space-y-3">
            <p className="text-sm font-semibold text-foreground">Share DevBench</p>
            <button
              type="button"
              onClick={() => void copySiteLink()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Link copied" : "Copy link"}
            </button>
            <div className="grid grid-cols-3 gap-2">
              {(["twitter", "linkedin", "reddit"] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => openSocial(n)}
                  className="rounded-lg border border-border py-2 text-[10px] font-semibold capitalize hover:bg-muted"
                >
                  {n === "twitter" ? "X" : n}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleBookmark}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-muted"
            >
              <Bookmark className="h-4 w-4" />
              {bookmarkDone ? "Bookmark hint shown" : "Bookmark this page"}
            </button>
            <button
              type="button"
              onClick={() => setToolkitOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-semibold text-accent-foreground hover:opacity-90"
            >
              <Gift className="h-4 w-4" />
              {toolkitUnlocked ? "Download toolkit again" : "Free JSON presets toolkit"}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={expanded}
        >
          <Share2 className="h-4 w-4 text-accent" aria-hidden />
          Share &amp; save
          <ChevronUp
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {/* Mobile: compact bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden border-t border-border bg-background/95 px-3 py-2 gap-2 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setToolkitOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-xs font-semibold text-accent-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          Toolkit
        </button>
        <button
          type="button"
          onClick={() => void copySiteLink()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          Share
        </button>
        <Link
          href="#tools"
          className="flex-1 inline-flex items-center justify-center rounded-xl border border-border py-2.5 text-xs font-semibold"
        >
          Tools
        </Link>
      </div>

      {toolkitOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="toolkit-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-2 mb-4">
              <h2 id="toolkit-dialog-title" className="text-lg font-semibold">
                Starter JSON toolkit
              </h2>
              <button
                type="button"
                onClick={() => setToolkitOpen(false)}
                className="rounded-lg p-1 hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Get formatter presets (API samples, config, repair exercises) as a free{" "}
              <code className="text-xs">.json</code> download. Enter your email or share DevBench
              on social to unlock.
            </p>
            {toolkitUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  downloadStarterToolkit();
                  setToolkitOpen(false);
                }}
                className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground"
              >
                Download {`devbench-json-formatter-presets.json`}
              </button>
            ) : (
              <>
                <form onSubmit={handleToolkitEmail} className="space-y-3">
                  <label htmlFor="toolkit-email" className="sr-only">
                    Email for toolkit download
                  </label>
                  <input
                    id="toolkit-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground"
                  >
                    Email me the download
                  </button>
                </form>
                <p className="my-3 text-center text-xs text-muted-foreground">or</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["twitter", "linkedin", "reddit"] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        openSocial(n);
                        setToolkitOpen(false);
                      }}
                      className="rounded-lg border border-border py-2 text-xs font-medium hover:bg-muted capitalize"
                    >
                      Share on {n === "twitter" ? "X" : n}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
