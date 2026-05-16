/**
 * Which tools require network access (live APIs, etc.).
 * Everything else is treated as offline-ready — processing stays on-device once loaded.
 */
export const SLUGS_NEED_NETWORK = new Set<string>([
  "currency-converter",
  "dns-lookup",
  "ip-info",
  "npm-compare",
]);

export type ToolConnectivity =
  | { mode: "offline" }
  | { mode: "network"; detail: string };

export function getToolConnectivity(slug: string): ToolConnectivity {
  if (slug === "dns-lookup") return { mode: "network", detail: "Cloudflare DoH" };
  if (slug === "ip-info")   return { mode: "network", detail: "ipapi.co" };
  if (slug === "npm-compare") return { mode: "network", detail: "registry.npmjs.org" };
  if (SLUGS_NEED_NETWORK.has(slug)) {
    return {
      mode: "network",
      detail: "Loads live FX rates (Frankfurter API)",
    };
  }
  return { mode: "offline" };
}
