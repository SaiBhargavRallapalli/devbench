// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Client-side tool pipelines — chain runTool-compatible steps without copy-paste.
 */
import { runTool, type ToolState } from "@/lib/tool-runner";
import { formatJson, minifyJson } from "@/lib/tool-engines";

export type PipelineStep = {
  id: string;
  slug: string;
  label: string;
  options?: Record<string, string | number | boolean>;
};

export type PipelineRunResult = {
  steps: { step: PipelineStep; output: string; error: string }[];
  finalOutput: string;
  finalError: string;
};

/** Built-in presets (slug must be supported by runPipelineStep). */
export const PIPELINE_PRESETS: { id: string; name: string; description: string; steps: PipelineStep[] }[] = [
  {
    id: "json-to-ts-pretty",
    name: "JSON → TypeScript (formatted)",
    description: "Validate JSON, generate TypeScript interfaces, then escape for embedding.",
    steps: [
      { id: "1", slug: "json-format", label: "Format JSON" },
      { id: "2", slug: "json-to-typescript", label: "JSON → TypeScript" },
    ],
  },
  {
    id: "yaml-api-prep",
    name: "YAML → JSON → minify",
    description: "Parse YAML to JSON and minify for API bodies.",
    steps: [
      { id: "1", slug: "yaml-to-json", label: "YAML → JSON" },
      { id: "2", slug: "json-minify", label: "Minify JSON" },
    ],
  },
  {
    id: "encode-chain",
    name: "URL encode → Base64",
    description: "Percent-encode text then Base64-encode the result.",
    steps: [
      { id: "1", slug: "url-encode", label: "URL encode" },
      { id: "2", slug: "base64-encode", label: "Base64 encode" },
    ],
  },
  {
    id: "decode-chain",
    name: "Base64 → URL decode",
    description: "Decode Base64 then URL-decode.",
    steps: [
      { id: "1", slug: "base64-decode", label: "Base64 decode" },
      { id: "2", slug: "url-decode", label: "URL decode" },
    ],
  },
  {
    id: "json-to-yaml-format",
    name: "JSON → YAML",
    description: "Format JSON then convert to YAML.",
    steps: [
      { id: "1", slug: "json-format", label: "Format JSON" },
      { id: "2", slug: "json-to-yaml", label: "JSON → YAML" },
    ],
  },
];

const BUILTIN_SLUGS = new Set(["json-format", "json-minify"]);

export const PIPELINE_STEP_CATALOG: PipelineStep[] = [
  { id: "json-format", slug: "json-format", label: "Format JSON" },
  { id: "json-minify", slug: "json-minify", label: "Minify JSON" },
  { id: "json-to-yaml", slug: "json-to-yaml", label: "JSON → YAML" },
  { id: "yaml-to-json", slug: "yaml-to-json", label: "YAML → JSON" },
  { id: "json-to-typescript", slug: "json-to-typescript", label: "JSON → TypeScript" },
  { id: "json-to-csv", slug: "json-to-csv", label: "JSON → CSV" },
  { id: "csv-to-json", slug: "csv-to-json", label: "CSV → JSON" },
  { id: "json-to-xml", slug: "json-to-xml", label: "JSON → XML" },
  { id: "xml-to-json", slug: "xml-to-json", label: "XML → JSON" },
  { id: "base64-encode", slug: "base64-encode", label: "Base64 encode" },
  { id: "base64-decode", slug: "base64-decode", label: "Base64 decode" },
  { id: "url-encode", slug: "url-encode", label: "URL encode" },
  { id: "url-decode", slug: "url-decode", label: "URL decode" },
  { id: "html-entity-encode", slug: "html-entity-encode", label: "HTML entity encode" },
  { id: "html-entity-decode", slug: "html-entity-decode", label: "HTML entity decode" },
  { id: "text-to-hex", slug: "text-to-hex", label: "Text → Hex" },
  { id: "hex-to-text", slug: "hex-to-text", label: "Hex → Text" },
  { id: "string-escape", slug: "string-escape", label: "Escape string (JSON)", options: { mode: "json" } },
  { id: "hash-generator", slug: "hash-generator", label: "SHA-256 hash", options: { algo: "SHA-256" } },
  { id: "slug-generator", slug: "slug-generator", label: "Slugify" },
  { id: "case-converter", slug: "case-converter", label: "camelCase", options: { targetCase: "camelCase" } },
  { id: "markdown-to-html", slug: "markdown-to-html", label: "Markdown → HTML" },
  { id: "html-to-text", slug: "html-to-text", label: "HTML → plain text" },
];

async function runPipelineStep(
  slug: string,
  input: string,
  options?: Record<string, string | number | boolean>,
): Promise<{ output: string; error: string }> {
  if (slug === "json-format") {
    const r = formatJson(input);
    return typeof r === "string" ? { output: r, error: "" } : { output: r.output, error: r.error ?? "" };
  }
  if (slug === "json-minify") {
    const r = minifyJson(input);
    return typeof r === "string" ? { output: r, error: "" } : { output: r.output, error: r.error ?? "" };
  }

  const state: ToolState = { input, output: "", error: "", options: options ?? {} };
  const result = await runTool(slug, state);
  if (typeof result === "string") return { output: result, error: "" };
  return { output: result.output ?? "", error: result.error ?? "" };
}

export async function runPipeline(
  initialInput: string,
  steps: PipelineStep[],
): Promise<PipelineRunResult> {
  const stepResults: PipelineRunResult["steps"] = [];
  let current = initialInput;

  for (const step of steps) {
    const { output, error } = await runPipelineStep(step.slug, current, step.options);
    stepResults.push({ step, output, error });
    if (error) {
      return { steps: stepResults, finalOutput: output, finalError: error };
    }
    current = output;
  }

  return { steps: stepResults, finalOutput: current, finalError: "" };
}

export function isPipelineSlug(slug: string): boolean {
  return BUILTIN_SLUGS.has(slug) || PIPELINE_STEP_CATALOG.some((s) => s.slug === slug);
}
