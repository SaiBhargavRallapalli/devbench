import { formatJson, minifyJson } from "@/lib/tool-engines";
import { formatJsonInWorker, shouldUseJsonWorker } from "@/lib/json-worker";

export type FormatJsonResult = { output: string; error?: string; usedWorker?: boolean };

export async function formatJsonWorkspace(
  input: string,
  mode: "format" | "minify",
  indent = 2,
): Promise<FormatJsonResult> {
  if (shouldUseJsonWorker(input)) {
    const r = await formatJsonInWorker(input, mode, indent);
    if (!r.error) return { output: r.output, usedWorker: true };
    return r;
  }
  const r = mode === "minify" ? minifyJson(input) : formatJson(input, indent);
  if (typeof r === "string") return { output: r };
  if (r.error) return { output: "", error: r.error };
  return { output: r.output };
}
