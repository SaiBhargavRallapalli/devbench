import { runJsonWorkspaceOp } from "@/lib/json-workspace-worker-client";

export type FormatJsonResult = { output: string; error?: string; usedWorker?: boolean };

export async function formatJsonWorkspace(
  input: string,
  mode: "format" | "minify",
  indent = 2,
): Promise<FormatJsonResult> {
  const r = await runJsonWorkspaceOp(
    mode === "minify" ? { op: "minify", input } : { op: "format", input, indent },
  );
  if (r.ok && r.output !== undefined) {
    return { output: r.output, usedWorker: r.usedWorker };
  }
  return { output: "", error: r.ok ? undefined : r.error, usedWorker: r.usedWorker };
}
