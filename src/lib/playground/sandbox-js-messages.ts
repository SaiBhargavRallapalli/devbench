import { SANDBOX_MESSAGE_SOURCE } from "@/lib/playground/constants";

export type SandboxChildMessage =
  | { source: typeof SANDBOX_MESSAGE_SOURCE; type: "READY" }
  | { source: typeof SANDBOX_MESSAGE_SOURCE; type: "LOG"; id: number; level: string; args: string[] }
  | { source: typeof SANDBOX_MESSAGE_SOURCE; type: "DONE"; id: number }
  | { source: typeof SANDBOX_MESSAGE_SOURCE; type: "ERROR"; id: number; message: string; stack: string }
  | { source: typeof SANDBOX_MESSAGE_SOURCE; type: "UNCAUGHT"; id: number; message: string; stack: string };

/** Treat sandbox code as untrusted, including messages it sends to the UI. */
export function isSandboxChildMessage(data: unknown): data is SandboxChildMessage {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  if (o.source !== SANDBOX_MESSAGE_SOURCE) return false;
  if (o.type === "READY") return true;
  if (!Number.isSafeInteger(o.id)) return false;
  if (o.type === "DONE") return true;
  if (o.type === "LOG") {
    return typeof o.level === "string" && o.level.length <= 32 && Array.isArray(o.args) &&
      o.args.length <= 100 && o.args.every((arg) => typeof arg === "string" && arg.length <= 16384);
  }
  return (o.type === "ERROR" || o.type === "UNCAUGHT") &&
    typeof o.message === "string" && o.message.length <= 32768 &&
    typeof o.stack === "string" && o.stack.length <= 65536;
}
