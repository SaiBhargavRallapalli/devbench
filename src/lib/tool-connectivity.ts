/**
 * Which tools require network access (live APIs, etc.).
 * Everything else is treated as offline-ready — processing stays on-device once loaded.
 */
export const SLUGS_NEED_NETWORK = new Set<string>([
  "currency-converter",
  "dns-lookup",
  "ip-info",
  "npm-compare",
  "background-remover",
  "websocket-tester",
  "mermaid-editor",
]);

export type ToolConnectivity =
  | { mode: "offline" }
  | { mode: "network"; detail: string };

export function getToolConnectivity(slug: string): ToolConnectivity {
  if (slug === "dns-lookup") return { mode: "network", detail: "Cloudflare DoH" };
  if (slug === "ip-info") return { mode: "network", detail: "ipapi.co" };
  if (slug === "npm-compare") return { mode: "network", detail: "registry.npmjs.org" };
  if (slug === "background-remover") {
    return { mode: "network", detail: "ML model CDN (first run)" };
  }
  if (slug === "websocket-tester") {
    return { mode: "network", detail: "User-entered WS/WSS endpoint" };
  }
  if (slug === "mermaid-editor") {
    return { mode: "network", detail: "Mermaid.js CDN (first load)" };
  }
  if (slug === "currency-converter") {
    return { mode: "network", detail: "Loads live FX rates (Frankfurter API)" };
  }
  return { mode: "offline" };
}
