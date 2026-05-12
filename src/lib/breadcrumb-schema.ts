import { SITE_URL } from "@/lib/social-metadata";

export interface BreadcrumbItem {
  /** Human-readable name shown in the SERP breadcrumb trail */
  name: string;
  /** Path relative to SITE_URL (e.g. "/blog" or "/tools/json-formatter"). Omit for the final item if you prefer to skip the URL — Google accepts that. */
  path?: string;
}

/**
 * Build a BreadcrumbList JSON-LD object suitable for <JsonLd data={...}/>.
 *
 * Always prepend Home as position 1 — Google's docs say a breadcrumb that doesn't
 * start at the site root is valid but rarely surfaced.
 */
export function breadcrumbSchema(trail: BreadcrumbItem[]): object {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    ...trail.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 2,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
