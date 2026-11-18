// Copyright (c) 2026 DevBench contributors. MIT License.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import RoadmapExplorer from "@/components/roadmaps/RoadmapExplorer";
import { ROADMAPS, countRoadmapNodes, getRoadmap } from "@/lib/roadmaps";
import { SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

export function generateStaticParams() {
  return ROADMAPS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = getRoadmap(slug);
  if (!roadmap) return { title: "Roadmap not found" };
  const title = `${roadmap.title} Roadmap — Free Interactive Learning Path`;
  return {
    title,
    description: roadmap.description,
    keywords: `${roadmap.title} roadmap, learn ${roadmap.title}, ${roadmap.title} learning path, free developer roadmap`,
    alternates: { canonical: `${SITE_URL}/roadmaps/${slug}` },
    openGraph: {
      title,
      description: roadmap.description,
      url: `${SITE_URL}/roadmaps/${slug}`,
      siteName: "DevBench",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: roadmap.description,
      site: "@devbench",
      creator: "@devbench",
    },
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = getRoadmap(slug);
  if (!roadmap) notFound();

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${roadmap.title} roadmap`,
    description: roadmap.description,
    url: `${SITE_URL}/roadmaps/${roadmap.slug}`,
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: roadmap.estimate,
    },
  };

  return (
    <>
      <Header />
      <JsonLd data={courseSchema} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Roadmaps", path: "/roadmaps" },
          { name: roadmap.title, path: `/roadmaps/${roadmap.slug}` },
        ])}
      />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Roadmaps", href: "/roadmaps" },
            { label: roadmap.title },
          ]}
        />

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {roadmap.title} roadmap
            </h1>
            <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium">
              {roadmap.kind === "role" ? "Role-based" : "Skill-based"}
            </span>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
            {roadmap.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{countRoadmapNodes(roadmap)} topics</span>
            <span>{roadmap.estimate}</span>
            <Link
              href={roadmap.communityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
            >
              Compare with the community roadmap on roadmap.sh
              <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>

        <RoadmapExplorer roadmap={roadmap} />
      </main>
      <Footer />
    </>
  );
}
