import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools-registry";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  return {
    title: tool ? `${tool.name} — Embed | DevBench` : "Embed | DevBench",
    robots: { index: false, follow: false },
  };
}

export default function EmbedSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
