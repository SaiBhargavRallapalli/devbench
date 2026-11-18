// Copyright (c) 2026 DevBench contributors. MIT License.
import type { Metadata } from "next";
import Link from "next/link";
import { Map as MapIcon, ArrowRight, Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { ROADMAPS, countRoadmapNodes } from "@/lib/roadmaps";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

const TITLE = "Developer Roadmaps — Free Interactive Learning Paths";
const DESC =
  "Free, interactive developer roadmaps: frontend, backend, DevOps, Python, React, SQL and AI engineer. Track your progress in the browser, follow curated free resources, and practice each topic with DevBench's free tools and code playground.";

export function generateMetadata(): Metadata {
  const canonical = `${SITE_URL}/roadmaps`;
  const social = socialMetadata({ title: TITLE, description: DESC, canonicalPath: "/roadmaps" });
  return {
    title: TITLE,
    description: DESC,
    keywords:
      "developer roadmap, frontend roadmap, backend roadmap, devops roadmap, python roadmap, react roadmap, sql roadmap, ai engineer roadmap, learn to code, programming learning path, free developer resources",
    alternates: { canonical },
    openGraph: { ...social.openGraph, url: canonical },
    twitter: social.twitter,
  };
}

const KIND_COLORS: Record<string, string> = {
  role: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  skill: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default function RoadmapsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESC,
    url: `${SITE_URL}/roadmaps`,
    isPartOf: { "@type": "WebSite", name: "DevBench", url: SITE_URL },
    hasPart: ROADMAPS.map((r) => ({
      "@type": "Course",
      name: `${r.title} roadmap`,
      description: r.description,
      url: `${SITE_URL}/roadmaps/${r.slug}`,
      isAccessibleForFree: true,
      provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
    })),
  };

  return (
    <>
      <Header />
      <JsonLd data={collectionSchema} />
      <JsonLd
        data={breadcrumbSchema([{ name: "Roadmaps", path: "/roadmaps" }])}
      />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <MapIcon className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Developer roadmaps</h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              Step-by-step learning paths for developers. Click any topic for a plain-language
              explanation and curated free resources, tick topics off as you learn — progress is
              saved in your browser, no account needed — and practice with DevBench&apos;s free
              tools and code playground along the way.
            </p>
          </div>
        </div>

        <p className="mb-8 text-xs text-muted-foreground max-w-2xl leading-relaxed">
          <Compass className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
          Each path also links to the matching community roadmap on{" "}
          <a
            href="https://roadmap.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            roadmap.sh
          </a>{" "}
          for a second opinion.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROADMAPS.map((roadmap) => (
            <Link
              key={roadmap.slug}
              href={`/roadmaps/${roadmap.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-accent/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${KIND_COLORS[roadmap.kind]}`}
                >
                  {roadmap.kind === "role" ? "Role-based" : "Skill-based"}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {countRoadmapNodes(roadmap)} topics
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                {roadmap.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{roadmap.tagline}</p>
              <p className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{roadmap.estimate}</span>
                <span className="inline-flex items-center gap-1 font-medium text-accent">
                  Start
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </p>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">How these roadmaps work</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
            <li>Every topic is a short, plain-language explanation plus hand-picked free resources — official docs first.</li>
            <li>Tick topics off as you learn; your progress stays in this browser and is never uploaded.</li>
            <li>Topics link to DevBench tools and runnable Playground snippets so you practice instead of only reading.</li>
            <li>Content is original to DevBench; we link out to roadmap.sh and official documentation rather than copying them.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
