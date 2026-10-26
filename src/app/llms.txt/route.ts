import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/site-config";
import { TOOLS, type ToolCategory } from "@/lib/tools-registry";

// Generated llms.txt — never stale: sections and counts derive from the tools
// registry and the blog index at build time, so every deploy ships a fresh copy.
// (Replaces the hand-maintained public/llms.txt, which drifted to "143+" and
// silently omitted 11 tools.)
export const dynamic = "force-static";

const CATEGORY_ORDER: { category: ToolCategory; heading: string }[] = [
  { category: "json", heading: "JSON & Data Tools" },
  { category: "encoding", heading: "Encoding & Decoding" },
  { category: "text", heading: "Text Utilities" },
  { category: "dev", heading: "Developer Tools" },
  { category: "image", heading: "Image Tools" },
  { category: "pdf", heading: "PDF Tools" },
  { category: "conversion", heading: "Unit & Format Converters" },
  { category: "finance", heading: "Finance Calculators" },
  { category: "health", heading: "Health Calculators" },
  { category: "math", heading: "Math Tools" },
  { category: "datetime", heading: "Date & Time Tools" },
];

export async function GET() {
  const lines: string[] = [
    "# DevBench",
    "",
    `> DevBench is a free, open-source collection of ${TOOLS.length}+ browser-based developer tools — JSON formatters, encoders, PDF utilities, image editors, calculators, converters, and more. All processing runs client-side; no account required and no data is uploaded to servers.`,
    "",
    `Live site: ${SITE_URL}`,
    "",
  ];

  for (const { category, heading } of CATEGORY_ORDER) {
    const tools = TOOLS.filter((t) => t.category === category);
    if (tools.length === 0) continue;
    lines.push(`## ${heading}`, "");
    for (const t of tools) {
      lines.push(`- [${t.name}](${SITE_URL}/tools/${t.slug}): ${t.description}`);
    }
    lines.push("");
  }

  lines.push(
    "## Reference",
    "",
    `- [Linux Cheatsheet](${SITE_URL}/linux-cheatsheet): Quick reference for common Linux commands — searchable, with copy-ready examples`,
    `- [Astronomy Tools](${SITE_URL}/astronomy): Sunrise, sunset, moon phase, and space utilities`,
    `- [Changelog](${SITE_URL}/changelog): What's new in DevBench — recent tools and updates`,
    `- [Blog](${SITE_URL}/blog): Articles and guides on developer tools and workflows`,
    `- [About](${SITE_URL}/about): About DevBench`,
    `- [Privacy Policy](${SITE_URL}/privacy): How DevBench handles (or rather, doesn't handle) your data`,
    "",
    "## Guides",
    "",
  );
  for (const p of BLOG_POSTS) {
    lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
