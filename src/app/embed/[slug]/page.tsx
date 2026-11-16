import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools-registry";
import EmbedToolClient from "./embed-client";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Unknown embed slugs must 404 (the client page soft-renders "Tool not
  // found" and the on-demand server render was erroring with a 500).
  if (!getToolBySlug(slug)) {
    notFound();
  }
  return <EmbedToolClient />;
}
