import { SITE_URL } from "@/lib/social-metadata";

/** Align with package.json when you ship — helps softwareVersion in JSON-LD. */
export const SOFTWARE_VERSION = "0.1.0";

/** Optional Schema.org WebApplication fields that reduce Rich Results "non-critical" warnings. */
export function webApplicationEnrichment(opts: {
  screenshotUrl: string;
  featureList: string[];
}) {
  return {
    featureList: opts.featureList,
    isAccessibleForFree: true,
    screenshot: opts.screenshotUrl,
    softwareVersion: SOFTWARE_VERSION,
  };
}

/** Absolute OG image URL for /tools/[slug] pages. */
export function toolScreenshotUrl(slug: string): string {
  return `${SITE_URL}/tools/${slug}/opengraph-image`;
}
