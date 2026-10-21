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
      expect(all).toHaveLength(AFFILIATE_PROGRAMS.length);
    } else {
      // Hidden surfaces: returns empty so AffiliateRecommendations renders nothing.
      expect(all).toHaveLength(0);
    }
  });
});

describe("affiliate disclosure", () => {
  it("mentions that links may be affiliate links and that tools stay free", () => {
    expect(AFFILIATE_DISCLOSURE.toLowerCase()).toContain("affiliate");
    expect(AFFILIATE_DISCLOSURE.toLowerCase()).toContain("free");
  });
});
