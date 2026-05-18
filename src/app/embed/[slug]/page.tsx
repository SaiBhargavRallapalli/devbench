"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { Copy, Check, Trash2, ExternalLink } from "lucide-react";
import { getToolBySlug } from "@/lib/tools-registry";
import CustomToolOutlet from "@/components/tools/CustomToolOutlet";
import {
  type ToolState,
  runTool,
  needsDualInput,
  needsNoInput,
} from "@/lib/tool-runner";

const CUSTOM_TOOL_SLUGS = new Set([
  "background-remover",
  "image-resizer", "image-compressor",
  "pdf-page-editor", "image-to-pdf",
  "merge-pdf", "split-pdf", "compress-pdf", "pdf-to-jpg", "rotate-pdf",
  "watermark-pdf", "organize-pdf", "pdf-page-numbers", "pdf-compare",
  "text-to-pdf", "html-to-pdf",
  "xml-suite",
  "qr-code", "age-calculator", "bmi-calculator", "compound-interest",
  "loan-emi-calculator", "contrast-checker", "gradient-generator", "currency-converter",
  "html-preview", "base64-image", "string-inspector", "markdown-preview",
  "regex-tester", "uuid-generator",
  "http-status-reference", "css-box-shadow",
  "image-format-converter", "svg-optimizer", "exif-viewer",
  "unicode-checker",
  "simple-interest", "gst-calculator", "discount-calculator",
  "tip-calculator", "roi-calculator", "profit-loss-calculator",
  "salary-hike-calculator",
  "bmr-calculator", "calorie-calculator", "water-intake-calculator", "body-fat-calculator",
  "quadratic-solver", "pythagorean-theorem", "gcd-lcm-calculator",
  "days-between-dates", "countdown-calculator", "week-number-calculator", "due-date-calculator",
  "timezone-converter",
  "mermaid-editor",
  "websocket-tester",
  "ipynb-to-pdf",
]);

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
      disabled={!text}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-40 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function EmbedPage() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugParam ?? "";
  const tool = getToolBySlug(slug);

  const [state, setState] = useState<ToolState>({
    input: "",
    input2: "",
    output: "",
    error: "",
    options: {},
  });

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
    } catch (e) {
      setState((s) => ({ ...s, output: "", error: (e as Error).message }));
    }
  }, [slug, state.input, state.input2, state.options]);

  useEffect(() => {
    if (CUSTOM_TOOL_SLUGS.has(slug)) return;
    const timer = setTimeout(process, 150);
    return () => clearTimeout(timer);
  }, [process, slug]);

  if (!tool) {
    return (
      <div className="flex items-center justify-center h-screen text-sm text-muted-foreground">
        Tool not found
      </div>
    );
  }

  if (CUSTOM_TOOL_SLUGS.has(slug)) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <CustomToolOutlet slug={slug} tool={tool} />
        <EmbedFooter slug={slug} name={tool.name} />
      </div>
    );
  }

  const isDual = needsDualInput(slug);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground p-3 gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">{tool.name}</span>
      </div>

      <div className={`flex-1 grid gap-3 ${isDual ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              {tool.inputLabel || "Input"}
            </label>
            <button
              onClick={() => setState((s) => ({ ...s, input: "", output: "", error: "" }))}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
              title="Clear"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <textarea
            value={state.input}
            onChange={(e) => setState((s) => ({ ...s, input: e.target.value }))}
            placeholder={`Paste ${tool.inputLabel?.toLowerCase() || "input"} here…`}
            className="flex-1 min-h-[200px] p-3 rounded-lg border border-border bg-card font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50"
            spellCheck={false}
          />
        </div>

        {/* Second input (dual-input tools) */}
        {isDual ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                {tool.outputLabel || "Input B"}
              </label>
              <button
                onClick={() => setState((s) => ({ ...s, input2: "" }))}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <textarea
              value={state.input2}
              onChange={(e) => setState((s) => ({ ...s, input2: e.target.value }))}
              placeholder="Paste second input here…"
              className="flex-1 min-h-[200px] p-3 rounded-lg border border-border bg-card font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50"
              spellCheck={false}
            />
          </div>
        ) : (
          /* Output */
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                {tool.outputLabel || "Output"}
              </label>
              <CopyBtn text={state.output} />
            </div>
            <textarea
              value={state.output}
              readOnly
              placeholder="Output will appear here…"
              className="flex-1 min-h-[200px] p-3 rounded-lg border border-border bg-muted/50 font-mono text-xs resize-none focus:outline-none placeholder:text-muted-foreground/50"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Diff output */}
      {isDual && state.output && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Diff</label>
            <CopyBtn text={state.output} />
          </div>
          <pre className="p-3 rounded-lg border border-border bg-card font-mono text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
            {state.output.split("\n").map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith("+") ? "text-success bg-success/10" :
                  line.startsWith("-") ? "text-destructive bg-destructive/10" :
                  line.startsWith("@@") ? "text-accent" : ""
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
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <EmbedFooter slug={slug} name={tool.name} />
    </div>
  );
}

function EmbedFooter({ slug, name }: { slug: string; name: string }) {
  const href = slug === "json-formatter"
    ? "/json"
    : slug === "jwt-debugger"
    ? "/jwt-debugger"
    : `/tools/${slug}`;

  return (
    <div className="flex items-center justify-end pt-1 border-t border-border">
      <a
        href={`https://www.devbench.co.in${href}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="w-2.5 h-2.5" />
        Open {name} on DevBench
      </a>
    </div>
  );
}
