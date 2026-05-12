"use client";

import { useEffect } from "react";

/**
 * Registers a minimal service worker that caches `/_next/static/*` assets so
 * repeat visits are faster and basic offline reload works after the first load.
 * Does not cache HTML documents (avoids stale RSC payloads).
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const ctrl = new AbortController();
    const { signal } = ctrl;

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        /* ignore registration failures (CSP, private mode, etc.) */
      });

    return () => ctrl.abort();
  }, []);

  return null;
}
