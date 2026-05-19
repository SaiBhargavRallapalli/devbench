"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Download,
  Sparkles,
  Share2,
  Code2,
} from "lucide-react";
import { getToolBySlug, CATEGORIES, TOOLS } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { TOOL_PAGE_CONTENT } from "@/lib/tool-page-content";
import Header from "@/components/Header";
import * as engines from "@/lib/tool-engines";
import {
  trackToolSuccess,
  trackToolError,
  trackToolCopy,
  trackToolShareLink,
} from "@/lib/analytics-events";
import CustomToolOutlet from "@/components/tools/CustomToolOutlet";
import ToolConnectivityBadge from "@/components/ToolConnectivityBadge";
import ToolPageActions from "@/components/ToolPageActions";
import {
  encodeSharedToolState,
  decodeSharedToolState,
  sharePayloadTooLong,
} from "@/lib/shareable-tool-state";
import {
  type ToolState,
  runTool,
  needsDualInput,
  needsNoInput,
} from "@/lib/tool-runner";

const CUSTOM_TOOL_SLUGS = new Set([
  // rich UI workspaces
  "background-remover",
  "image-resizer", "image-compressor",
  "pdf-page-editor", "image-to-pdf",
  "merge-pdf", "split-pdf", "compress-pdf", "pdf-to-jpg", "rotate-pdf",
  "watermark-pdf", "organize-pdf", "pdf-page-numbers", "pdf-compare",
  "text-to-pdf", "html-to-pdf",
  "xml-suite",
  "qr-code", "age-calculator", "bmi-calculator", "compound-interest",
  "loan-emi-calculator", "contrast-checker", "gradient-generator", "currency-converter",
  // dev tools with rich UI
  "html-preview", "base64-image", "string-inspector", "markdown-preview",
  "regex-tester", "uuid-generator",
  "http-status-reference", "css-box-shadow",
  "image-format-converter", "svg-optimizer", "exif-viewer",
  "unicode-checker",
  // finance form tools
  "simple-interest", "gst-calculator", "discount-calculator",
  "tip-calculator", "roi-calculator", "profit-loss-calculator",
  "salary-hike-calculator",
  // health form tools
  "bmr-calculator", "calorie-calculator", "water-intake-calculator", "body-fat-calculator",
  // math form tools
  "quadratic-solver", "pythagorean-theorem", "gcd-lcm-calculator",
  // datetime form tools
  "days-between-dates", "countdown-calculator", "week-number-calculator", "due-date-calculator",
  "timezone-converter",
  // diagramming
  "mermaid-editor",
  // networking
  "websocket-tester",
  // PDF
  "ipynb-to-pdf",
  // developer utilities
  "gitignore-generator", "license-generator", "env-validator",
  "dns-lookup", "ip-info", "npm-compare",
  "color-converter", "color-palette",
]);

function EmbedButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const code = `<iframe src="https://www.devbench.co.in/embed/${slug}" width="100%" height="500" style="border:none;border-radius:12px;" title="${slug}" loading="lazy"></iframe>`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Code2 className="w-3.5 h-3.5" />
      )}
      {copied ? "Embed code copied" : "Get embed code"}
    </button>
  );
}

function CopyBtn({ text, toolSlug }: { text: string; toolSlug?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (toolSlug) trackToolCopy(toolSlug, "output");
    }).catch(() => {});
  };
  return (
    <button
      onClick={copy}
      disabled={!text}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-40 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/** Browsers omit crypto.subtle on insecure HTTP (except localhost). */
function AesWebCryptoUnavailableHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(
      typeof globalThis.crypto !== "undefined" &&
        globalThis.crypto.subtle === undefined
    );
  }, []);
  if (!show) return null;
  return (
    <p
      role="status"
      className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2"
    >
      Web Crypto isn&apos;t available on this URL (needs HTTPS or{" "}
      <span className="font-mono">localhost</span>). Use a secure origin or AES
      encryption will fail.
    </p>
  );
}


export default function ToolPage() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugParam ?? "";
  const tool = getToolBySlug(slug);
  const isCustomTool = Boolean(tool && CUSTOM_TOOL_SLUGS.has(slug));

  const [state, setState] = useState<ToolState>({
    input: "",
    input2: "",
    output: "",
    error: "",
    options: {},
  });

  const [shareCopied, setShareCopied] = useState(false);
  const shareHydrated = useRef(false);
  const persistKey = `devbench:input:${slug}`;

  useEffect(() => {
    if (shareHydrated.current) return;
    if (typeof window === "undefined") return;
    const shared = decodeSharedToolState(window.location.hash);
    if (shared) {
      shareHydrated.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((s) => ({ ...s, input: shared.i, input2: shared.i2 ?? "" }));
      return;
    }
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        const { input, input2 } = JSON.parse(saved) as { input: string; input2: string };
        setState((s) => ({ ...s, input: input ?? "", input2: input2 ?? "" }));
      }
    } catch {}
  }, [persistKey]);

  useEffect(() => {
    if (CUSTOM_TOOL_SLUGS.has(slug)) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify({ input: state.input, input2: state.input2 }));
    } catch {}
  }, [slug, persistKey, state.input, state.input2]);

  const copyShareLink = useCallback(() => {
    const fragment = encodeSharedToolState(
      state.input,
      needsDualInput(slug) ? state.input2 : undefined,
    );
    if (sharePayloadTooLong(fragment)) {
      window.alert(
        "This input is too large to pack into a URL. Copy the text manually or shorten it.",
      );
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}${fragment}`;
    void navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      trackToolShareLink(slug);
    }).catch(() => {});
  }, [slug, state.input, state.input2]);

  const setInput = (input: string) => setState((s) => ({ ...s, input }));
  const setInput2 = (input2: string) => setState((s) => ({ ...s, input2 }));
  const setOption = (key: string, value: string | number | boolean) =>
    setState((s) => ({ ...s, options: { ...s.options, [key]: value } }));

  const process = useCallback(async () => {
    if (CUSTOM_TOOL_SLUGS.has(slug)) return;
    if (!state.input.trim() && !needsNoInput(slug)) {
      setState((s) => ({ ...s, output: "", error: "" }));
      return;
    }

    try {
      const result = await runTool(slug, state);
      const output = typeof result === "string" ? result : result.output || "";
      const error = typeof result === "string" ? "" : result.error || "";
      setState((s) => ({ ...s, output, error }));
      if (error) {
        trackToolError(slug, "process", error);
      } else if (output) {
        trackToolSuccess(slug, "process");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "An error occurred";
      setState((s) => ({ ...s, output: "", error: message }));
      trackToolError(slug, "process", message);
    }
  }, [slug, state.input, state.input2, state.options]);

  useEffect(() => {
    if (CUSTOM_TOOL_SLUGS.has(slug)) return;
    const timer = setTimeout(process, 150);
    return () => clearTimeout(timer);
  }, [process, slug]);

  if (!tool) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The tool &quot;{slug}&quot; doesn&apos;t exist.
            </p>
            <Link href="/" className="text-accent hover:underline">← Back to tools</Link>
          </div>
        </main>
      </>
    );
  }

  if (isCustomTool) {
    return (
      <>
        <Header />
        <CustomToolOutlet slug={slug} tool={tool} />
      </>
    );
  }

  const category = CATEGORIES[tool.category];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            All Tools
          </Link>
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono ${category.color}`}
            >
              {tool.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${category.color}`}
                >
                  {category.label}
                </span>
                <ToolConnectivityBadge slug={slug} />
                <ToolPageActions
                  slug={slug}
                  getContent={() => state.input}
                  getContent2={() => state.input2 ?? ""}
                  vaultTitle={tool.shortName}
                />
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {shareCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  {shareCopied ? "Link copied" : "Copy share link"}
                </button>
                <EmbedButton slug={slug} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {TOOL_PAGE_CONTENT[slug]?.openingParagraph ?? tool.description}
              </p>
            </div>
          </div>
        </div>

        {/* Tool options */}
        {renderOptions(slug, state.options, setOption)}

        {/* Input / Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">
          {/* Input */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                {tool.inputLabel || "Input"}
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      input: "",
                      output: "",
                      error: "",
                    }))
                  }
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  title="Clear"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <textarea
              value={state.input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your ${tool.inputLabel?.toLowerCase() || "input"} here...`}
              className="flex-1 min-h-[300px] p-4 rounded-xl border border-border bg-card font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50 scrollbar-thin"
              spellCheck={false}
            />
          </div>

          {/* Second input for diff-style tools */}
          {needsDualInput(slug) ? (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {tool.outputLabel || "Input B"}
                </label>
                <button
                  onClick={() => setInput2("")}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={state.input2}
                onChange={(e) => setInput2(e.target.value)}
                placeholder="Paste second input here..."
                className="flex-1 min-h-[300px] p-4 rounded-xl border border-border bg-card font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50 scrollbar-thin"
                spellCheck={false}
              />
            </div>
          ) : (
            /* Output */
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {tool.outputLabel || "Output"}
                </label>
                <div className="flex items-center gap-1">
                  <CopyBtn text={state.output} toolSlug={slug} />
                  {state.output && (
                    <button
                      onClick={() => {
                        const blob = new Blob([state.output], {
                          type: "text/plain",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${slug}-output.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={state.output}
                readOnly
                placeholder="Output will appear here..."
                className="flex-1 min-h-[300px] p-4 rounded-xl border border-border bg-muted/50 font-mono text-sm resize-none focus:outline-none placeholder:text-muted-foreground/50 scrollbar-thin"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Diff output for dual-input tools */}
        {needsDualInput(slug) && state.output && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Diff Result</label>
              <CopyBtn text={state.output} toolSlug={slug} />
            </div>
            <pre className="p-4 rounded-xl border border-border bg-card font-mono text-sm overflow-auto max-h-[400px] scrollbar-thin whitespace-pre-wrap">
              {state.output.split("\n").map((line, i) => (
                <div
                  key={i}
                  className={
                    line.startsWith("+")
                      ? "text-success bg-success/10"
                      : line.startsWith("-")
                        ? "text-destructive bg-destructive/10"
                        : line.startsWith("@@")
                          ? "text-accent"
                          : ""
                  }
                >
                  {line}
                </div>
              ))}
            </pre>
          </div>
        )}

        {/* Error */}
        {state.error && (
          <div className="mt-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 animate-fade-in">
            <p className="text-sm text-destructive font-medium">
              {state.error}
            </p>
          </div>
        )}

        {/* Stats */}
        {state.input && !state.error && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Input: {state.input.length} chars</span>
            {state.output && <span>Output: {state.output.length} chars</span>}
            {state.output && state.input.length > 0 && (
              <span>
                Ratio:{" "}
                {((state.output.length / state.input.length) * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Related tools */}
        {(() => {
          const related = TOOLS.filter(
            (t) => t.category === tool.category && t.slug !== slug,
          ).slice(0, 6);
          if (related.length === 0) return null;
          return (
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                More {category.label} tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {related.map((t) => (
                  <Link
                    key={t.slug}
                    href={publicHrefForToolSlug(t.slug)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${CATEGORIES[t.category].color}`}
                    >
                      {t.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {t.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </main>
    </>
  );
}

function renderOptions(
  slug: string,
  options: Record<string, string | number | boolean>,
  setOption: (key: string, value: string | number | boolean) => void
) {
  const selectClass =
    "px-3 py-1.5 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40";
  const inputClass =
    "px-3 py-1.5 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 w-20";

  switch (slug) {
    case "case-converter":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Target Case:</label>
          <select
            value={(options.targetCase as string) || "camelCase"}
            onChange={(e) => setOption("targetCase", e.target.value)}
            className={selectClass}
          >
            <option value="camelCase">camelCase</option>
            <option value="PascalCase">PascalCase</option>
            <option value="snake_case">snake_case</option>
            <option value="kebab-case">kebab-case</option>
            <option value="UPPER_CASE">UPPER_CASE</option>
            <option value="lower">lowercase</option>
            <option value="Title">Title Case</option>
            <option value="Sentence">Sentence case</option>
          </select>
        </div>
      );
    case "line-sorter":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Mode:</label>
          <select
            value={(options.mode as string) || "asc"}
            onChange={(e) => setOption("mode", e.target.value)}
            className={selectClass}
          >
            <option value="asc">Sort A → Z</option>
            <option value="desc">Sort Z → A</option>
            <option value="reverse">Reverse</option>
            <option value="shuffle">Shuffle</option>
            <option value="unique">Remove Duplicates</option>
          </select>
        </div>
      );
    case "lorem-ipsum":
      return (
        <div className="mb-4 flex flex-wrap gap-3">
          <div>
            <label className="text-sm font-medium mr-2">Count:</label>
            <input
              type="number"
              min={1}
              max={50}
              value={(options.count as number) || 3}
              onChange={(e) => setOption("count", parseInt(e.target.value) || 3)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium mr-2">Unit:</label>
            <select
              value={(options.unit as string) || "paragraphs"}
              onChange={(e) => setOption("unit", e.target.value)}
              className={selectClass}
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
        </div>
      );
    case "uuid-generator":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Count:</label>
          <input
            type="number"
            min={1}
            max={25}
            value={(options.count as number) || 5}
            onChange={(e) => setOption("count", parseInt(e.target.value) || 5)}
            className={inputClass}
          />
        </div>
      );
    case "password-generator":
      return (
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-sm font-medium mr-2">Length:</label>
            <input
              type="number"
              min={4}
              max={128}
              value={(options.length as number) || 16}
              onChange={(e) =>
                setOption("length", parseInt(e.target.value) || 16)
              }
              className={inputClass}
            />
          </div>
          {["Uppercase", "Lowercase", "Digits", "Symbols"].map((opt) => {
            const key = opt.toLowerCase();
            return (
              <label key={opt} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={options[key] !== false}
                  onChange={(e) => setOption(key, e.target.checked)}
                  className="rounded"
                />
                {opt}
              </label>
            );
          })}
        </div>
      );
    case "string-escape":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Mode:</label>
          <select
            value={(options.mode as string) || "json"}
            onChange={(e) => setOption("mode", e.target.value)}
            className={selectClass}
          >
            <option value="json">JSON</option>
            <option value="js">JavaScript</option>
            <option value="sql">SQL</option>
            <option value="regex">Regex</option>
          </select>
        </div>
      );
    case "curl-formatter":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Output:</label>
          <select
            value={(options.layout as string) || "multiline"}
            onChange={(e) => setOption("layout", e.target.value)}
            className={selectClass}
          >
            <option value="multiline">Multi-line (POSIX / bash)</option>
            <option value="oneline">Single line</option>
          </select>
        </div>
      );
    case "base-converter":
      return (
        <div className="mb-4 flex flex-wrap gap-3">
          <div>
            <label className="text-sm font-medium mr-2">From:</label>
            <select
              value={(options.fromBase as number) || 10}
              onChange={(e) => setOption("fromBase", parseInt(e.target.value))}
              className={selectClass}
            >
              <option value={2}>Binary (2)</option>
              <option value={8}>Octal (8)</option>
              <option value={10}>Decimal (10)</option>
              <option value={16}>Hex (16)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-2">To:</label>
            <select
              value={(options.toBase as number) || 16}
              onChange={(e) => setOption("toBase", parseInt(e.target.value))}
              className={selectClass}
            >
              <option value={2}>Binary (2)</option>
              <option value={8}>Octal (8)</option>
              <option value={10}>Decimal (10)</option>
              <option value={16}>Hex (16)</option>
            </select>
          </div>
        </div>
      );
    case "whitespace-normalizer":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Mode:</label>
          <select
            value={(options.mode as string) || "collapse"}
            onChange={(e) => setOption("mode", e.target.value)}
            className={selectClass}
          >
            <option value="collapse">Collapse spaces</option>
            <option value="trim">Trim lines</option>
            <option value="remove-blank">Remove blank lines</option>
            <option value="single-space">Single space between words</option>
            <option value="all">All normalizations</option>
          </select>
        </div>
      );
    case "find-replace":
      return (
        <div className="mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm font-medium block mb-1">Find:</label>
            <input
              type="text"
              value={(options.find as string) || ""}
              onChange={(e) => setOption("find", e.target.value)}
              placeholder="Search text"
              className={`${selectClass} w-48`}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Replace:</label>
            <input
              type="text"
              value={(options.replace as string) || ""}
              onChange={(e) => setOption("replace", e.target.value)}
              placeholder="Replace with"
              className={`${selectClass} w-48`}
            />
          </div>
          <label className="flex items-center gap-1.5 text-sm pb-1.5">
            <input
              type="checkbox"
              checked={!!options.useRegex}
              onChange={(e) => setOption("useRegex", e.target.checked)}
              className="rounded"
            />
            Regex
          </label>
          <label className="flex items-center gap-1.5 text-sm pb-1.5">
            <input
              type="checkbox"
              checked={!!options.caseInsensitive}
              onChange={(e) => setOption("caseInsensitive", e.target.checked)}
              className="rounded"
            />
            Case insensitive
          </label>
        </div>
      );
    case "unit-converter": {
      const unitOptions: Record<string, string[]> = {
        length: ["mm", "cm", "m", "km", "inch", "ft", "yd", "mi", "nm"],
        weight: ["mg", "g", "kg", "t", "oz", "lb", "st"],
        area: ["mm²", "cm²", "m²", "km²", "in²", "ft²", "yd²", "mi²", "ha", "ac"],
        volume: ["ml", "cl", "dl", "l", "m³", "tsp", "tbsp", "fl oz", "cup", "pt", "qt", "gal", "in³", "ft³"],
        speed: ["m/s", "km/h", "mph", "knot", "ft/s", "mach"],
        temperature: ["C", "F", "K"],
      };
      const cat = (options.unitCategory as string) || "length";
      const units = unitOptions[cat] || unitOptions.length;
      return (
        <div className="mb-4 flex flex-wrap gap-3">
          <div>
            <label className="text-sm font-medium mr-2">Category:</label>
            <select value={cat} onChange={(e) => setOption("unitCategory", e.target.value)} className={selectClass}>
              {Object.keys(unitOptions).map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-2">From:</label>
            <select value={(options.unitFrom as string) || units[0]} onChange={(e) => setOption("unitFrom", e.target.value)} className={selectClass}>
              {units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-2">To:</label>
            <select value={(options.unitTo as string) || units[1]} onChange={(e) => setOption("unitTo", e.target.value)} className={selectClass}>
              {units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      );
    }
    case "temperature-converter":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">From:</label>
          <select
            value={(options.from as string) || "C"}
            onChange={(e) => setOption("from", e.target.value)}
            className={selectClass}
          >
            <option value="C">Celsius</option>
            <option value="F">Fahrenheit</option>
            <option value="K">Kelvin</option>
          </select>
        </div>
      );
    case "byte-converter":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">From Unit:</label>
          <select
            value={(options.fromUnit as string) || "B"}
            onChange={(e) => setOption("fromUnit", e.target.value)}
            className={selectClass}
          >
            {["B", "KB", "MB", "GB", "TB", "PB"].map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      );
    case "hash-generator":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Algorithm:</label>
          <select
            value={(options.algo as string) || "SHA-256"}
            onChange={(e) => setOption("algo", e.target.value)}
            className={selectClass}
          >
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </div>
      );
    case "aes-encrypt-decrypt": {
      const pwGenLen = Math.min(
        128,
        Math.max(4, (options.aesPwLen as number) || 24)
      );
      const pwGenOpts = {
        uppercase: options.aesPwUppercase !== false,
        lowercase: options.aesPwLowercase !== false,
        digits: options.aesPwDigits !== false,
        symbols: options.aesPwSymbols !== false,
      };
      const fillGeneratedPassword = () => {
        const r = engines.generatePassword(pwGenLen, pwGenOpts);
        if (typeof r === "string") {
          setOption("password", r);
          return;
        }
        if (!r.error && r.output) setOption("password", r.output);
      };

      return (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-sm font-medium block mb-1">Mode:</label>
              <select
                value={(options.mode as string) || "encrypt"}
                onChange={(e) => setOption("mode", e.target.value)}
                className={selectClass}
              >
                <option value="encrypt">Encrypt</option>
                <option value="decrypt">Decrypt</option>
              </select>
            </div>
            <div className="min-w-[12rem] flex-1 max-w-md">
              <label className="text-sm font-medium block mb-1">Password:</label>
              <input
                type="password"
                value={(options.password as string) || ""}
                onChange={(e) => setOption("password", e.target.value)}
                placeholder="Enter password…"
                autoComplete="off"
                className={selectClass + " w-full"}
              />
            </div>
            <p className="text-xs text-muted-foreground py-1.5 max-w-xs">
              AES-256-GCM · PBKDF2 key derivation · client-side only
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/25 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Password generator
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <label className="text-xs font-medium mr-2">Length:</label>
                <input
                  type="number"
                  min={4}
                  max={128}
                  value={(options.aesPwLen as number) || 24}
                  onChange={(e) =>
                    setOption("aesPwLen", parseInt(e.target.value) || 24)
                  }
                  className={inputClass}
                />
              </div>
              {(
                [
                  ["Uppercase", "aesPwUppercase"],
                  ["Lowercase", "aesPwLowercase"],
                  ["Digits", "aesPwDigits"],
                  ["Symbols", "aesPwSymbols"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={options[key] !== false}
                    onChange={(e) => setOption(key, e.target.checked)}
                    className="rounded"
                  />
                  {label}
                </label>
              ))}
              <button
                type="button"
                onClick={fillGeneratedPassword}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill password
              </button>
            </div>
          </div>

          <AesWebCryptoUnavailableHint />
        </div>
      );
    }
    case "gst-calculator":
      return (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">GST basis:</label>
          <select
            value={(options.gstBasis as string) || "exclusive"}
            onChange={(e) => setOption("gstBasis", e.target.value)}
            className={selectClass}
          >
            <option value="exclusive">Add GST to net amount</option>
            <option value="inclusive">Extract GST from gross</option>
          </select>
        </div>
      );
    default:
      return null;
  }
}
