import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { normaliseHost, PLAYGROUND_HOST, PLAYGROUND_ORIGIN, SITE_URL } from "@/lib/site-config";
import { TOOL_PAGE_CONTENT } from "@/lib/tool-page-content";
import { socialMetadata } from "@/lib/social-metadata";

const PG_SLUG = "code-playground";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = normaliseHost(h.get("x-forwarded-host") ?? h.get("host"));
  const canonical = host === PLAYGROUND_HOST ? `${PLAYGROUND_ORIGIN}/` : `${SITE_URL}/playground`;
  const extra = TOOL_PAGE_CONTENT[PG_SLUG];
  const title =
    extra?.title ?? "Code playground — JavaScript, TypeScript, Python, Go, notebooks";
  const description =
    extra?.metaDescription ??
    "Run JavaScript and TypeScript in a sandboxed iframe with console capture, Python and notebooks via Pyodide (WASM), and Go via the official Go Playground API — in your browser.";
  const social = socialMetadata({
    title,
    description,
    canonicalPath: "/playground",
  });
  return {
    title,
    description,
    alternates: { canonical },
    keywords: [
      "code playground",
      "monaco editor",
      "pyodide",
      "typescript",
      "javascript sandbox",
      "go playground",
      "jupyter notebook",
      "stdin",
      "devbench",
    ],
    openGraph: { ...social.openGraph, url: canonical },
    twitter: social.twitter,
  };
}

export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return children;
}
