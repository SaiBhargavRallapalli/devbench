"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  xmlSuiteValidate,
  xmlSuitePrettyPrint,
  xmlSuiteMinify,
  xmlSuiteXPath,
  xmlSuiteSearch,
} from "@/lib/tool-engines";

type Mode = "validate" | "pretty" | "minify" | "xpath" | "search";

export default function XmlSuiteTool({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<Mode>("validate");
  const [xml, setXml] = useState("");
  const [extra, setExtra] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const sample = useMemo(
    () =>
      `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">\n    <name>alpha</name>\n  </item>\n  <item id="2">\n    <name>beta</name>\n  </item>\n</root>`,
    []
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setCopied(false);
      if (!xml.trim()) {
        setOut("");
        setErr("");
        return;
      }
      let r: string | { output: string; error?: string };
      switch (mode) {
        case "validate":
          r = xmlSuiteValidate(xml);
          break;
        case "pretty":
          r = xmlSuitePrettyPrint(xml);
          break;
        case "minify":
          r = xmlSuiteMinify(xml);
          break;
        case "xpath":
          r = xmlSuiteXPath(xml, extra);
          break;
        case "search":
          r = xmlSuiteSearch(xml, extra);
          break;
        default:
          r = { output: "", error: "" };
      }
      if (typeof r === "string") {
        setOut(r);
        setErr("");
      } else {
        setOut(r.output || "");
        setErr(r.error || "");
      }
    }, mode === "xpath" || mode === "search" ? 280 : 180);
    return () => clearTimeout(t);
  }, [xml, extra, mode]);

  const copyOut = () => {
    if (!out) return;
    void navigator.clipboard.writeText(out).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const tabs: { id: Mode; label: string; hint: string }[] = [
    { id: "validate", label: "Validate", hint: "Well-formedness" },
    { id: "pretty", label: "Pretty-print", hint: "Indent & format" },
    { id: "minify", label: "Minify", hint: "Compact markup" },
    { id: "xpath", label: "XPath", hint: "Query nodes" },
    { id: "search", label: "Search", hint: "Find text by line" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === tab.id
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={tab.hint}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setXml(sample)}
          className="ml-auto rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          Load sample
        </button>
      </div>

      {(mode === "xpath" || mode === "search") && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            {mode === "xpath" ? "XPath expression" : "Search string"}
          </label>
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder={
              mode === "xpath" ? "/root/item/name or //item[@id='1']" : "e.g. beta"
            }
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            spellCheck={false}
          />
        </div>
      )}

      <div className="grid animate-slide-up gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium">{tool.inputLabel || "XML"}</label>
          <textarea
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            placeholder="Paste XML here…"
            spellCheck={false}
            className="min-h-[320px] flex-1 resize-y rounded-xl border border-border bg-card p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">{tool.outputLabel || "Result"}</label>
            <button
              type="button"
              disabled={!out}
              onClick={copyOut}
              className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20 disabled:opacity-40"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={err ? err : out}
            placeholder="Output appears here…"
            className={`min-h-[320px] flex-1 resize-y rounded-xl border p-4 font-mono text-sm ${
              err
                ? "border-destructive/40 bg-destructive/5 text-destructive"
                : "border-border bg-muted/40 text-foreground"
            }`}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        XPath uses the browser&apos;s DOM XPath engine. Default namespaces in some documents may
        require{" "}
        <code className="rounded bg-muted px-1">local-name()</code> predicates, for example:{" "}
        <code className="rounded bg-muted px-1">{`//*[local-name()='tag']`}</code>
      </p>
    </main>
  );
}
