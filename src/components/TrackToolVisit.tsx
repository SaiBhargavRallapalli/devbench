"use client";

import { useEffect } from "react";
import { trackToolVisit } from "@/lib/analytics-events";
import { recordToolVisit } from "@/lib/devbench-preferences";
import { getToolBySlug } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";

const RECENT_KEY = "devbench:recent";
const MAX_RECENT = 8;

export default function TrackToolVisit({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const prev: string[] = raw ? JSON.parse(raw) : [];
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    trackToolVisit(slug);

    const tool = getToolBySlug(slug);
    if (tool) {
      recordToolVisit({
        slug,
        name: tool.shortName,
        href: publicHrefForToolSlug(slug),
      });
    }
  }, [slug]);
  return null;
}
