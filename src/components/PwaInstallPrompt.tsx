"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("devbench:pwa-dismiss") === "1") return;
    setDismissed(false);

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (dismissed || !deferred) return null;

  return (
    <div
      role="region"
      aria-label="Install DevBench app"
      className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-lg sm:left-auto"
    >
      <div className="flex gap-3">
        <Download className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install DevBench</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add to your home screen for faster access and offline static assets.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                void deferred.prompt().then(() => {
                  setDeferred(null);
                  setDismissed(true);
                });
              }}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("devbench:pwa-dismiss", "1");
                setDismissed(true);
                setDeferred(null);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("devbench:pwa-dismiss", "1");
            setDismissed(true);
          }}
          className="p-1 rounded hover:bg-muted shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
