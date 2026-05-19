"use client";

import { useLayoutEffect, useState } from "react";
import { BLOG_HOST, PLAYGROUND_HOST, SITE_URL } from "@/lib/site-config";

/**
 * When the UI is loaded on a subdomain, main-site tool links should use `www`
 * so client-side navigation does not hit the subdomain host (middleware would
 * 308, which is unreliable for `next/link`). `homePath` is the path on `www`
 * that maps to `/` on the current subdomain — used to keep the "home" nav
 * link local instead of bouncing to `www`.
 */
export function useExternalNavOrigin(): { origin: string; homePath: string } {
  const [state, setState] = useState({ origin: "", homePath: "" });
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (typeof window === "undefined") return;
      const { hostname } = window.location;
      if (hostname === PLAYGROUND_HOST) {
        setState({ origin: SITE_URL, homePath: "/playground" });
      } else if (hostname === BLOG_HOST) {
        setState({ origin: SITE_URL, homePath: "/blog" });
      }
    });
  }, []);
  return state;
}
