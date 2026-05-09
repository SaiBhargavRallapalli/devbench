/**
 * Which tools require network access (live APIs, etc.).
 * Everything else is treated as offline-ready — processing stays on-device once loaded.
 */
export const SLUGS_NEED_NETWORK = new Set<string>(["currency-converter"]);

export type ToolConnectivity =
  | { mode: "offline" }
  | { mode: "network"; detail: string };

export function getToolConnectivity(slug: string): ToolConnectivity {
  if (SLUGS_NEED_NETWORK.has(slug)) {
    return {
      mode: "network",
      detail: "Loads live FX rates (Frankfurter API)",
    };
  }
  return { mode: "offline" };
}
