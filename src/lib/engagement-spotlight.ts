// Copyright (c) 2026 DevBench contributors. MIT License.
import { getToolBySlug } from "@/lib/tools-registry";

/**
 * Curated spotlight pool — one high-traffic tool from each major category so
 * the hero highlights the breadth of DevBench, not just JSON tools.
 *
 * Rotates once per UTC day so different tools get hero placement and SEO signal
 * without causing hydration mismatches (server + client share the same UTC day).
 */
const SPOTLIGHT_POOL = [
  "jwt-debugger",         // dev      — high-volume developer search
  "password-generator",   // dev      — massive general audience
  "merge-pdf",            // pdf      — huge non-dev audience
  "regex-tester",         // text     — popular with developers
  "hash-generator",       // dev      — MD5 / SHA / bcrypt searches
  "loan-emi-calculator",  // finance  — large Indian audience
  "base64-encode",        // encoding — very popular
  "uuid-generator",       // dev      — universally useful
  "json-formatter",       // json     — still popular, no longer always #1
  "url-encode",           // encoding — common search term
  "curl-to-fetch",        // dev      — niche but high-intent
] as const;

/** Returns today's spotlight tool — deterministic within a UTC day. */
export function getSpotlightTool() {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % SPOTLIGHT_POOL.length;
  return getToolBySlug(SPOTLIGHT_POOL[dayIndex]);
}
