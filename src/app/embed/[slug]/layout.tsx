import type { Metadata } from "next";
import { getToolBySlug, TOOLS } from "@/lib/tools-registry";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  return {
    // absolute: the root title template would otherwise append a second
    // "| DevBench" suffix.
    title: { absolute: tool ? `${tool.name} — Embed | DevBench` : "Embed | DevBench" },
    robots: { index: false, follow: false },
  };
}

export default function EmbedSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
