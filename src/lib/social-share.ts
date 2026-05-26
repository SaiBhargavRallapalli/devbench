// Copyright (c) 2026 DevBench contributors. MIT License.
import { SITE_URL } from "@/lib/social-metadata";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import type { Tool } from "@/lib/tools-registry";

export type SocialNetwork = "twitter" | "linkedin" | "reddit";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function toolShareUrl(tool: Pick<Tool, "slug">): string {
  return absoluteUrl(publicHrefForToolSlug(tool.slug));
}

export function siteShareUrl(): string {
  return SITE_URL;
}

export function shareTextForTool(tool: Pick<Tool, "name" | "description" | "slug">): string {
  return `${tool.name} — ${tool.description.slice(0, 120)}${tool.description.length > 120 ? "…" : ""}`;
}

export function shareTextForSite(): string {
  return "DevBench — 100+ free developer tools in your browser. No signup, private on-device processing.";
}

export function buildTwitterShareUrl(text: string, url: string): string {
  const params = new URLSearchParams({
    text: `${text} ${url}`,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function buildLinkedInShareUrl(url: string): string {
  const params = new URLSearchParams({ url });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

export function buildRedditShareUrl(title: string, url: string): string {
  const params = new URLSearchParams({ title, url });
  return `https://www.reddit.com/submit?${params.toString()}`;
}

export function buildSocialShareUrl(
  network: SocialNetwork,
  opts: { text: string; url: string },
): string {
  switch (network) {
    case "twitter":
      return buildTwitterShareUrl(opts.text, opts.url);
    case "linkedin":
      return buildLinkedInShareUrl(opts.url);
    case "reddit":
      return buildRedditShareUrl(opts.text, opts.url);
    default: {
      const _exhaustive: never = network;
      return _exhaustive;
    }
  }
}

export function tweetToolUrl(tool: Pick<Tool, "name" | "description" | "slug">): string {
  return buildTwitterShareUrl(shareTextForTool(tool), toolShareUrl(tool));
}
