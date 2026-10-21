"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "devbench-consent";
type ConsentChoice = "granted" | "denied";

/** Sentinel meaning "storage not read yet" (server / pre-hydration). */
const UNKNOWN = "__unknown__";

/**
 * Google Consent Mode v2 is set to DENY everything by default in the root
 * layout's inline <head> script (before GTM/AdSense load). This banner is the
 * second half: it surfaces a choice and, on accept, flips the signals to
 * `granted` so ads/analytics may run.
 *
 * The stored value is read via `useSyncExternalStore` — the correct primitive
 * for external (localStorage) state. It keeps the read out of render/effects,
 * is SSR-safe (server renders nothing via the UNKNOWN sentinel), and React
 * re-renders automatically once the real value is known on the client.
 *
 * Deliberately first-party (no external CMP dependency) — it stores one string
 * in localStorage and pushes `gtag('consent','update', …). For full TCF
 * compliance in the EEA you'd swap in Google Funding Choices; this covers the
 * common "no cookies before consent" requirement without a render-blocking
 * third party.
 */
function subscribe(callback: () => void): () => void {
  // Fires in *other* tabs when consent changes there.
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return ""; // storage disabled → treat as undecided
  }
}

function getServerSnapshot(): string {
  return UNKNOWN;
}

function applyConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* private mode / storage disabled — consent still applies this page view */
  }
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      ad_storage: choice,
      ad_user_data: choice,
      ad_personalization: choice,
      analytics_storage: choice,
    });
  } else if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push([
      "consent",
      "update",
      {
        ad_storage: choice,
        ad_user_data: choice,
        ad_personalization: choice,
        analytics_storage: choice,
      },
    ]);
  }
}

export default function ConsentBanner() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Local decision set on click (event handler, not an effect) so the same-tab
  // write is reflected immediately — the `storage` event only fires cross-tab.
  const [decision, setDecision] = useState<ConsentChoice | null>(null);

  const storedChoice: ConsentChoice | null =
    stored === "granted" || stored === "denied" ? stored : null;
  const choice = decision ?? storedChoice;
  // Only reveal once storage has actually been read (not UNKNOWN) and no
  // valid choice exists — so returning visitors never see a flash.
  const show = stored !== UNKNOWN && !choice;

  if (!show) return null;

  const decide = (next: ConsentChoice) => {
    applyConsent(next);
    setDecision(next);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[110] border-t border-border bg-card/95 p-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted-foreground">
          We use cookies for ads and analytics to keep DevBench free. See our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
