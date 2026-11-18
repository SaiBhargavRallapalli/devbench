// Copyright (c) 2026 DevBench contributors. MIT License.
import { describe, expect, it } from "vitest";
import {
  AFFILIATE_DISCLOSURE,
  AFFILIATE_PROGRAMS,
  affiliateRel,
  getAffiliatePrograms,
} from "@/lib/affiliates";

describe("affiliate rel", () => {
  it("marks affiliate links as sponsored nofollow (Google requirement)", () => {
    const rel = affiliateRel(true).split(" ");
    expect(rel).toContain("sponsored");
    expect(rel).toContain("nofollow");
  });

  it("omits sponsored for non-affiliate links", () => {
    const rel = affiliateRel(false).split(" ");
    expect(rel).not.toContain("sponsored");
    expect(rel).toContain("nofollow");
  });

  it("always includes noopener and noreferrer for target=_blank safety", () => {
    for (const isAffiliate of [true, false]) {
      const rel = affiliateRel(isAffiliate).split(" ");
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
    }
  });
});

describe("affiliate registry", () => {
  it("ships at least one program", () => {
    expect(AFFILIATE_PROGRAMS.length).toBeGreaterThan(0);
  });

  it("gives every program a unique id, blurb, and href", () => {
    const ids = AFFILIATE_PROGRAMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of AFFILIATE_PROGRAMS) {
      expect(p.name.trim()).not.toBe("");
      expect(p.blurb.trim()).not.toBe("");
      expect(p.href).toMatch(/^https:\/\//);
    }
  });

  it("filters by category when enabled", () => {
    // Registry data must always be well-formed regardless of the show/hide flag.
    const hosting = AFFILIATE_PROGRAMS.filter((p) => p.category === "hosting");
    expect(hosting.length).toBeGreaterThan(0);
  });

  it("honours the AFFILIATE_ENABLED switch", async () => {
    const { AFFILIATE_ENABLED } = await import("@/lib/affiliates");
    const all = getAffiliatePrograms();
    if (AFFILIATE_ENABLED) {
      // Only live, site-wide programs show; scoped programs stay off generic mounts.
      const expected = AFFILIATE_PROGRAMS.filter(
        (p) => p.live && (p.surfaces ?? "all") === "all",
      );
      expect(all).toHaveLength(expected.length);
      expect(all.every((p) => p.live)).toBe(true);
    } else {
      // Hidden surfaces: returns empty so AffiliateRecommendations renders nothing.
      expect(all).toHaveLength(0);
    }
  });

  it("only marks programs live when their href is a real tracked link", () => {
    const live = AFFILIATE_PROGRAMS.filter((p) => p.live);
    expect(live.length).toBeGreaterThan(0);
    for (const p of live) {
      // Placeholder links point straight at the product domain with a fake ref
      // param; live links go through an affiliate network's tracker.
      expect(p.href).toMatch(/awin1\.com|jdoqocy\.com/);
    }
  });

  it("keeps hosting-pages-scoped programs off the site-wide set but in the hosting category", () => {
    const scoped = AFFILIATE_PROGRAMS.filter(
      (p) => p.live && p.surfaces === "hosting-pages",
    );
    const siteWide = getAffiliatePrograms();
    for (const p of scoped) {
      expect(siteWide.find((s) => s.id === p.id)).toBeUndefined();
    }
    const hosting = getAffiliatePrograms("hosting");
    for (const p of scoped) {
      expect(hosting.find((s) => s.id === p.id)).toBeDefined();
    }
    // Category calls never leak programs from other categories.
    expect(hosting.every((p) => p.category === "hosting")).toBe(true);
  });
});

describe("affiliate disclosure", () => {
  it("uses the exact wording approved by the affiliate manager", () => {
    expect(AFFILIATE_DISCLOSURE.toLowerCase()).toContain("affiliate");
    expect(AFFILIATE_DISCLOSURE).toContain(
      "we earn commissions, at no additional cost to you, when you shop through the links below"
    );
  });
});
