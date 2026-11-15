// Copyright (c) 2026 DevBench contributors. MIT License.

/**
 * Pure builder for HTML `<head>` meta tags — the logic behind the Meta Tag
 * Generator. Everything is a plain string transform so it is trivially testable
 * and runs entirely in the browser.
 */

export interface MetaInput {
  title: string;
  description: string;
  /** Comma-separated keywords (legacy but still crawled by some engines). */
  keywords?: string;
  /** Canonical/OG URL. */
  url?: string;
  /** Absolute or relative path to the social share image. */
  image?: string;
  siteName?: string;
  /** `website`, `article`, `product`, … */
  type?: string;
  /** Twitter/X handle without the @, e.g. `devbench`. */
  twitterHandle?: string;
  /** `summary`, `summary_large_image`, … */
  twitterCard?: string;
  /** `index,follow`, `noindex,nofollow`, … */
  robots?: string;
  /** `en`, `en-US`, … */
  locale?: string;
  /** App ID / numeric IDs some platforms want. */
  appId?: string;
}

/** Escape a value for use inside a double-quoted HTML attribute. */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tag(name: string, content: string): string {
  return `<meta name="${name}" content="${escapeAttr(content)}">`;
}

function property(name: string, content: string): string {
  return `<meta property="${name}" content="${escapeAttr(content)}">`;
}

/**
 * Build the full block of head tags. Empty optional fields are skipped so the
 * output never contains blank tags.
 */
export function buildMetaTags(input: MetaInput): string {
  const lines: string[] = [];

  if (input.title.trim()) {
    lines.push(`<title>${escapeAttr(input.title.trim())}</title>`);
    lines.push(property("og:title", input.title.trim()));
  }
  if (input.description.trim()) {
    lines.push(tag("description", input.description.trim()));
    lines.push(property("og:description", input.description.trim()));
  }
  if (input.keywords?.trim()) {
    lines.push(tag("keywords", input.keywords.trim()));
  }
  if (input.url?.trim()) {
    lines.push(`<link rel="canonical" href="${escapeAttr(input.url.trim())}">`);
    lines.push(property("og:url", input.url.trim()));
  }
  if (input.image?.trim()) {
    const img = input.image.trim();
    lines.push(property("og:image", img));
    lines.push(tag("twitter:image", img));
  }
  if (input.siteName?.trim()) {
    lines.push(property("og:site_name", input.siteName.trim()));
  }
  if (input.type?.trim()) {
    lines.push(property("og:type", input.type.trim()));
  }
  if (input.locale?.trim()) {
    lines.push(property("og:locale", input.locale.trim()));
  }
  if (input.twitterCard?.trim()) {
    lines.push(tag("twitter:card", input.twitterCard.trim()));
  }
  if (input.twitterHandle?.trim()) {
    const handle = input.twitterHandle.trim().replace(/^@/, "");
    lines.push(tag("twitter:site", `@${handle}`));
    lines.push(tag("twitter:creator", `@${handle}`));
  }
  if (input.robots?.trim()) {
    lines.push(tag("robots", input.robots.trim()));
  }
  if (input.appId?.trim()) {
    lines.push(property("fb:app_id", input.appId.trim()));
  }

  // Always useful defaults so the block is complete even from minimal input.
  if (!lines.some((l) => l.includes('name="description"'))) {
    lines.splice(1, 0, tag("description", ""));
  }
  if (!lines.some((l) => l.includes('property="og:type"'))) {
    lines.push(property("og:type", "website"));
  }
  if (!lines.some((l) => l.includes('name="twitter:card"'))) {
    lines.push(tag("twitter:card", "summary_large_image"));
  }

  return lines.join("\n");
}

export interface MetaLengths {
  title: number;
  description: number;
  /** Google typically shows ~55–60 chars of title and ~155–160 of description. */
  titleOk: boolean;
  descriptionOk: boolean;
}

/** Length guidance — title ≤ 60, description ≤ 160 keeps SERP truncation away. */
export function metaLengths(input: MetaInput): MetaLengths {
  const title = input.title.trim().length;
  const description = input.description.trim().length;
  return {
    title,
    description,
    titleOk: title > 0 && title <= 60,
    descriptionOk: description > 0 && description <= 160,
  };
}
