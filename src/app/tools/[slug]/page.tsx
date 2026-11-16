import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools-registry";
import { TOOL_PAGE_CONTENT } from "@/lib/tool-page-content";
import { CUSTOM_TOOL_SLUGS } from "@/lib/custom-tool-slugs";
import CustomToolPageClient from "@/components/tools/CustomToolPageClient";
import GenericToolPageClient from "@/components/tools/GenericToolPageClient";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    // Real 404 status, not a soft-404: unknown tool URLs must not index as
    // thin duplicates of the catalog.
    notFound();
  }

  if (CUSTOM_TOOL_SLUGS.has(slug)) {
    return <CustomToolPageClient slug={slug} tool={tool} />;
  }

  const openingParagraph =
    TOOL_PAGE_CONTENT[slug]?.openingParagraph ?? tool.description;

  return (
    <GenericToolPageClient
      slug={slug}
      tool={tool}
      openingParagraph={openingParagraph}
    />
  );
}
