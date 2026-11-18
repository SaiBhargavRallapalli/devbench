// Copyright (c) 2026 DevBench contributors. MIT License.
import { describe, expect, it } from "vitest";
import {
  ROADMAPS,
  allNodeIds,
  countRoadmapNodes,
  getRoadmap,
  roadmapProgressPercent,
} from "@/lib/roadmaps";
import { getToolBySlug } from "@/lib/tools-registry";

describe("roadmaps registry", () => {
  it("has unique slugs", () => {
    const slugs = ROADMAPS.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every roadmap has sections, nodes and a community link", () => {
    for (const roadmap of ROADMAPS) {
      expect(roadmap.sections.length).toBeGreaterThanOrEqual(3);
      expect(countRoadmapNodes(roadmap)).toBeGreaterThanOrEqual(10);
      expect(roadmap.communityUrl).toMatch(/^https:\/\/roadmap\.sh\//);
      expect(roadmap.description.length).toBeGreaterThan(40);
    }
  });

  it("node ids are unique within each roadmap", () => {
    for (const roadmap of ROADMAPS) {
      const ids = allNodeIds(roadmap);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("section ids are unique within each roadmap", () => {
    for (const roadmap of ROADMAPS) {
      const ids = roadmap.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every external resource uses https", () => {
    for (const roadmap of ROADMAPS) {
      for (const section of roadmap.sections) {
        for (const node of section.nodes) {
          expect(node.resources.length).toBeGreaterThanOrEqual(1);
          for (const res of node.resources) {
            // Internal DevBench links are allowed as /path resources
            if (res.url.startsWith("/")) continue;
            expect(res.url).toMatch(/^https:\/\//);
          }
        }
      }
    }
  });

  it("referenced DevBench tools exist in the tools registry", () => {
    for (const roadmap of ROADMAPS) {
      for (const section of roadmap.sections) {
        for (const node of section.nodes) {
          for (const slug of node.tools ?? []) {
            expect(getToolBySlug(slug), `${roadmap.slug}/${node.id} -> ${slug}`).toBeTruthy();
          }
        }
      }
    }
  });

  it("internal links start with / and playground snippets are non-empty", () => {
    for (const roadmap of ROADMAPS) {
      for (const section of roadmap.sections) {
        for (const node of section.nodes) {
          for (const link of node.internalLinks ?? []) {
            expect(link.href.startsWith("/")).toBe(true);
          }
          if (node.playground) {
            expect(node.playground.code.trim().length).toBeGreaterThan(10);
          }
        }
      }
    }
  });

  it("getRoadmap resolves slugs and rejects unknown ones", () => {
    expect(getRoadmap("frontend")?.title).toBe("Frontend Developer");
    expect(getRoadmap("nope")).toBeUndefined();
  });

  it("computes progress percent safely", () => {
    expect(roadmapProgressPercent(0, 10)).toBe(0);
    expect(roadmapProgressPercent(5, 10)).toBe(50);
    expect(roadmapProgressPercent(3, 0)).toBe(0);
    expect(roadmapProgressPercent(1, 3)).toBe(33);
  });
});
