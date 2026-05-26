"use client";

import { useEffect, useState } from "react";
import { Network, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "devbench:porthole-promo-v2";

export default function PortholePromo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="complementary"
      aria-label="Porthole announcement"
      className="fixed bottom-4 right-4 z-[90] w-72 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-slide-up"
    >
      {/* Gradient accent strip */}
      <div className="h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-2.5 ring-1 ring-indigo-100 dark:ring-indigo-900">
            <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm font-semibold leading-none">Porthole</p>
              <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                New
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Route and inspect traffic through a local proxy — built for developers.
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <a
          href="https://porthole.devbench.co.in/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Try Porthole
          <ArrowRight className="w-3 h-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}
