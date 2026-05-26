// Copyright (c) 2026 DevBench contributors. MIT License.
import { getToolBySlug } from "@/lib/tools-registry";

/** Homepage hero spotlight — popular entry tool. */
export const SPOTLIGHT_TOOL_SLUG = "json-formatter";

export function getSpotlightTool() {
  return getToolBySlug(SPOTLIGHT_TOOL_SLUG);
}
