// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Cross-module integrity tests — the wiring contract that has no single owner.
 *
 * Adding a tool touches many files (registry entry, CUSTOM_TOOL_SLUGS, a
 * CustomToolOutlet case + dynamic import, SEO content, FAQs, hub lists,
 * related-tool maps). Nothing enforced the set stayed consistent, so a typo
 * silently rendered an "Unknown tool" page or a blank outlet. These tests lock
 * every cross-reference so the failure mode becomes a red test instead of a
 * broken page.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { POST_CONTENT } from "@/components/blog/PostContent";
import { CONTENT_MAP } from "@/components/tools/ToolSeoContent";
import { BLOG_POSTS } from "@/lib/blog";
import { CUSTOM_TOOL_SLUGS, DATETIME_TOOL_SLUGS, FINANCE_TOOL_SLUGS, HEALTH_TOOL_SLUGS, MATH_TOOL_SLUGS } from "@/lib/custom-tool-slugs";
import { IMAGE_HUB_ORDER } from "@/lib/image-hub";
import { getRelatedToolSlugs } from "@/lib/related-tools";
import { getToolBySlug, TOOLS } from "@/lib/tools-registry";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { TOOL_PAGE_CONTENT } from "@/lib/tool-page-content";

const SLUG_RE = /^[a-z0-9-]+$/;
const registrySlugs = new Set(TOOLS.map((t) => t.slug));

describe("tools registry", () => {
  it("has unique, well-formed slugs", () => {
    expect(TOOLS.length).toBeGreaterThan(0);
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(SLUG_RE);
  });

  it("returns tools for every declared category heading", () => {
    for (const tool of TOOLS) {
      expect(getToolBySlug(tool.slug)).toBeDefined();
    }
  });
});

describe("CustomToolOutlet wiring", () => {
  const source = readFileSync(
    path.join(process.cwd(), "src/components/tools/CustomToolOutlet.tsx"),
    "utf8",
  );

  it("every CUSTOM_TOOL_SLUGS entry is wired into the outlet", () => {
    // Two legitimate wiring styles: a dedicated switch case, or membership in
    // a category group set (finance/health/math/datetime tools share one
    // form component each — see the FINANCE_TOOL_SLUGS.has() branches).
    const groupWired = new Set([
      ...FINANCE_TOOL_SLUGS,
      ...HEALTH_TOOL_SLUGS,
      ...MATH_TOOL_SLUGS,
      ...DATETIME_TOOL_SLUGS,
    ]);
    for (const slug of CUSTOM_TOOL_SLUGS) {
      const hasCase = source.includes(`case "${slug}"`);
      expect(
        hasCase || groupWired.has(slug),
        `CustomToolOutlet does not handle "${slug}" — no switch case and not in any group set`,
      ).toBe(true);
    }
  });

  it("every outlet case is a declared custom slug", () => {
    const cases = [...source.matchAll(/case "([a-z0-9-]+)":/g)].map((m) => m[1]);
    expect(cases.length).toBeGreaterThan(0);
    for (const slug of cases) {
      expect(CUSTOM_TOOL_SLUGS.has(slug), `Outlet handles "${slug}" but it is not in CUSTOM_TOOL_SLUGS`).toBe(true);
    }
  });

  it("every CUSTOM_TOOL_SLUGS entry exists in the registry", () => {
    for (const slug of CUSTOM_TOOL_SLUGS) {
      expect(registrySlugs.has(slug), `"${slug}" is a custom tool but has no registry entry`).toBe(true);
    }
  });
});

describe("SEO content coverage", () => {
  it("every TOOL_PAGE_CONTENT key is a real tool", () => {
    for (const slug of Object.keys(TOOL_PAGE_CONTENT)) {
      expect(registrySlugs.has(slug), `TOOL_PAGE_CONTENT has orphan key "${slug}"`).toBe(true);
    }
  });

  it("every TOOL_FAQS key is a real tool or a standalone vanity page", () => {
    // Standalone routes (/json, /pdf, /yaml, …) look up FAQs by their own page
    // key — these are consumed by app/*/layout.tsx files, not orphans.
    const VANITY_PAGE_KEYS = new Set([
      "json",
      "yaml",
      "pdf",
      "diff-checker",
      "api-tester",
      "code-beautify",
      "cron-editor",
      "astronomy",
    ]);
    for (const slug of Object.keys(TOOL_FAQS)) {
      expect(
        registrySlugs.has(slug) || VANITY_PAGE_KEYS.has(slug),
        `TOOL_FAQS has orphan key "${slug}" (not a tool, not a known vanity page)`,
      ).toBe(true);
    }
  });

  it("every custom tool has bespoke page content and FAQs", () => {
    for (const slug of CUSTOM_TOOL_SLUGS) {
      expect(TOOL_PAGE_CONTENT[slug], `custom tool "${slug}" lacks TOOL_PAGE_CONTENT`).toBeDefined();
      expect(TOOL_FAQS[slug]?.length, `custom tool "${slug}" lacks TOOL_FAQS`).toBeGreaterThan(0);
    }
  });

  it("every CONTENT_MAP key is a real tool (no typo'd slugs that never render)", () => {
    for (const slug of Object.keys(CONTENT_MAP)) {
      expect(registrySlugs.has(slug), `CONTENT_MAP has orphan key "${slug}"`).toBe(true);
    }
  });

  it("every custom tool has bespoke long-form SEO content", () => {
    for (const slug of CUSTOM_TOOL_SLUGS) {
      expect(CONTENT_MAP[slug], `custom tool "${slug}" lacks a CONTENT_MAP entry`).toBeDefined();
    }
  });
});

describe("hub and related-tool lists", () => {
  it("IMAGE_HUB_ORDER only references real tools, with no duplicates", () => {
    expect(new Set(IMAGE_HUB_ORDER).size).toBe(IMAGE_HUB_ORDER.length);
    for (const slug of IMAGE_HUB_ORDER) {
      expect(registrySlugs.has(slug), `image hub lists unknown tool "${slug}"`).toBe(true);
    }
  });

  it("getRelatedToolSlugs only returns real tools", () => {
    for (const tool of TOOLS) {
      for (const slug of getRelatedToolSlugs(tool.slug)) {
        expect(registrySlugs.has(slug), `related-tools for "${tool.slug}" references unknown "${slug}"`).toBe(true);
      }
    }
  });
});

describe("blog integrity", () => {
  it("has unique slugs and matching POST_CONTENT for every post", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const post of BLOG_POSTS) {
      expect(POST_CONTENT[post.slug], `blog post "${post.slug}" has no POST_CONTENT body`).toBeDefined();
    }
    for (const key of Object.keys(POST_CONTENT)) {
      expect(slugs.includes(key), `POST_CONTENT has orphan body "${key}"`).toBe(true);
    }
  });

  it("relatedBlogSlugs all resolve", () => {
    const slugs = new Set(BLOG_POSTS.map((p) => p.slug));
    for (const post of BLOG_POSTS) {
      for (const rel of post.relatedBlogSlugs ?? []) {
        expect(slugs.has(rel), `"${post.slug}" links unknown related post "${rel}"`).toBe(true);
      }
    }
  });

  it("relatedToolSlug resolves or falls back to an explicit href", () => {
    for (const post of BLOG_POSTS) {
      if (!post.relatedToolSlug) continue;
      const resolved = registrySlugs.has(post.relatedToolSlug);
      expect(
        resolved || Boolean(post.relatedToolHref),
        `"${post.slug}" has relatedToolSlug "${post.relatedToolSlug}" that is not in the registry and no relatedToolHref fallback`,
      ).toBe(true);
    }
  });

  it("tool-absolute relatedToolHref values point at real tools", () => {
    for (const post of BLOG_POSTS) {
      const href = post.relatedToolHref;
      if (!href?.startsWith("/tools/")) continue;
      const slug = href.slice("/tools/".length);
      expect(registrySlugs.has(slug), `"${post.slug}" links unknown tool page "${href}"`).toBe(true);
    }
  });
});
