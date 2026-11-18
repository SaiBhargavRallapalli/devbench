"use client";

import Header from "@/components/Header";
import RelatedToolsSection from "@/components/RelatedToolsSection";
import CustomToolOutlet from "@/components/tools/CustomToolOutlet";
import ToolPageHero, { ShellHeroScope } from "@/components/tools/ToolPageHero";
import type { Tool } from "@/lib/tools-registry";

/**
 * Custom tools only — no engines / tool-runner in this chunk.
 *
 * The hero is rendered here, in the shell, so it lands in the server HTML
 * even when the tool body below is loaded with `ssr: false`. The outlet runs
 * inside `ShellHeroScope`, which suppresses the hero the tool component
 * renders itself — one hero, one `<h1>`, present in the initial payload.
 */
export default function CustomToolPageClient({
  slug,
  tool,
}: {
  slug: string;
  tool: Tool;
}) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full scroll-mt-20">
        <ToolPageHero tool={tool} />
        <ShellHeroScope>
          <CustomToolOutlet slug={slug} tool={tool} />
        </ShellHeroScope>
        <RelatedToolsSection
          slug={slug}
          variant="cards"
          className="mt-10 border-t border-border pt-8 scroll-mt-24"
        />
      </main>
    </>
  );
}
