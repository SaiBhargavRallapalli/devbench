"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Tags } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  buildMetaTags,
  metaLengths,
  type MetaInput,
} from "@/lib/meta-tags";
import { copyWithFeedback } from "@/lib/clipboard";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

const TYPES = ["website", "article", "product", "profile"];
const TWITTER_CARDS = ["summary", "summary_large_image"];

function LenBadge({ ok, len, max, label }: { ok: boolean; len: number; max: number; label: string }) {
  return (
    <span
      className={`text-[11px] font-medium ${
        len === 0 ? "text-muted-foreground" : ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
      }`}
    >
      {label}: {len}/{max}
    </span>
  );
}

export default function MetaTagGeneratorTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState<MetaInput>({
    title: "DevBench — Free Online Developer Tools",
    description:
      "Format JSON, convert encodings, test regex and more — 170+ free browser-based developer tools with no signup.",
    keywords: "developer tools, json formatter, regex tester, base64",
    url: "https://www.devbench.co.in/",
    image: "https://www.devbench.co.in/og.png",
    siteName: "DevBench",
    type: "website",
    twitterCard: "summary_large_image",
    twitterHandle: "devbench",
    robots: "index, follow",
    locale: "en_US",
  });
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof MetaInput>(key: K, value: MetaInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const tags = useMemo(() => buildMetaTags(input), [input]);
  const lengths = useMemo(() => metaLengths(input), [input]);

  const copy = () => {
    copyWithFeedback(tags).then((ok) => {
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const field = (
    key: keyof MetaInput,
    label: string,
    props: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {},
  ) => (
    <div>
      <label htmlFor={`mt-${key}`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={`mt-${key}`}
        value={input[key] ?? ""}
        onChange={(e) => set(key, e.target.value as MetaInput[typeof key])}
        className={inp}
        {...props}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="mt-title" className="block text-sm font-medium">
                  Page title
                </label>
                <LenBadge
                  ok={lengths.titleOk}
                  len={lengths.title}
                  max={60}
                  label="Title"
                />
              </div>
              <input
                id="mt-title"
                value={input.title}
                onChange={(e) => set("title", e.target.value)}
                className={inp}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="mt-description" className="block text-sm font-medium">
                  Meta description
                </label>
                <LenBadge
                  ok={lengths.descriptionOk}
                  len={lengths.description}
                  max={160}
                  label="Description"
                />
              </div>
              <textarea
                id="mt-description"
                value={input.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className={inp}
              />
            </div>

            {field("keywords", "Keywords (comma-separated)")}
            {field("url", "Page URL", { type: "url", placeholder: "https://…" })}
            {field("image", "Share image URL", { type: "url", placeholder: "https://…/og.png" })}
            {field("siteName", "Site name")}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="mt-type" className="mb-1.5 block text-sm font-medium">
                  og:type
                </label>
                <select
                  id="mt-type"
                  value={input.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={inp}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mt-card" className="mb-1.5 block text-sm font-medium">
                  twitter:card
                </label>
                <select
                  id="mt-card"
                  value={input.twitterCard}
                  onChange={(e) => set("twitterCard", e.target.value)}
                  className={inp}
                >
                  {TWITTER_CARDS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {field("twitterHandle", "Twitter/X handle", { placeholder: "devbench" })}
              {field("robots", "Robots", { placeholder: "index, follow" })}
            </div>
            {field("locale", "Locale", { placeholder: "en_US" })}
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Paste inside &lt;head&gt;
              </p>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
              >
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre
              aria-live="polite"
              className="max-h-[560px] overflow-auto rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground"
            >
              <code>{tags}</code>
            </pre>
            {!lengths.titleOk && lengths.title > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Title is {lengths.title} characters — search engines typically show
                about 60 before truncating.
              </p>
            )}
            {!lengths.descriptionOk && lengths.description > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Description is {lengths.description} characters — around 155–160
                keeps it from being cut off in results.
              </p>
            )}
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tags className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Includes Open Graph and Twitter Card tags so links preview correctly on
          Facebook, X, Slack and iMessage. Everything runs locally.
        </p>
      </div>
    </main>
  );
}
