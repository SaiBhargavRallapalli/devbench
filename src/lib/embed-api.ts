/**
 * Embed v2 — postMessage protocol between parent page and /embed/[slug] iframe.
 *
 * Parent → iframe: DEVBENCH_EMBED_CMD
 * iframe → parent: DEVBENCH_EMBED_EVT
 */

export const EMBED_MSG_SOURCE = "devbench-embed" as const;

export type EmbedTheme = "light" | "dark" | "auto";

export type EmbedConfig = {
  theme?: EmbedTheme;
  /** Auto-run tool when input is set programmatically */
  autoRun?: boolean;
};

export type EmbedCommand =
  | { type: "SET_INPUT"; input: string; input2?: string }
  | { type: "RUN" }
  | { type: "CLEAR" }
  | { type: "GET_STATE" }
  | { type: "CONFIGURE"; config: EmbedConfig };

export type EmbedEvent =
  | { type: "READY"; slug: string; name: string }
  | { type: "STATE"; input: string; input2: string; output: string; error: string }
  | { type: "OUTPUT"; output: string; error: string }
  | { type: "RESIZE"; height: number };

export function isEmbedCommand(data: unknown): data is EmbedCommand & { source: typeof EMBED_MSG_SOURCE } {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.source !== EMBED_MSG_SOURCE) return false;
  return (
    d.type === "SET_INPUT" ||
    d.type === "RUN" ||
    d.type === "CLEAR" ||
    d.type === "GET_STATE" ||
    d.type === "CONFIGURE"
  );
}

export function postEmbedCommand(target: Window, cmd: EmbedCommand, origin = "*"): void {
  target.postMessage({ source: EMBED_MSG_SOURCE, ...cmd }, origin);
}

export function postEmbedEvent(parent: Window, evt: EmbedEvent, origin = "*"): void {
  parent.postMessage({ source: EMBED_MSG_SOURCE, ...evt }, origin);
}

/** Helper for host pages embedding DevBench tools */
export function createEmbedController(iframe: HTMLIFrameElement) {
  return {
    setInput(input: string, input2?: string) {
      if (!iframe.contentWindow) return;
      postEmbedCommand(iframe.contentWindow, { type: "SET_INPUT", input, input2 });
    },
    run() {
      if (!iframe.contentWindow) return;
      postEmbedCommand(iframe.contentWindow, { type: "RUN" });
    },
    clear() {
      if (!iframe.contentWindow) return;
      postEmbedCommand(iframe.contentWindow, { type: "CLEAR" });
    },
    getState() {
      if (!iframe.contentWindow) return;
      postEmbedCommand(iframe.contentWindow, { type: "GET_STATE" });
    },
    configure(config: EmbedConfig) {
      if (!iframe.contentWindow) return;
      postEmbedCommand(iframe.contentWindow, { type: "CONFIGURE", config });
    },
    onEvent(handler: (evt: EmbedEvent) => void): () => void {
      const fn = (ev: MessageEvent) => {
        const d = ev.data;
        if (!d || d.source !== EMBED_MSG_SOURCE || !d.type) return;
        if (ev.source !== iframe.contentWindow) return;
        handler(d as EmbedEvent);
      };
      window.addEventListener("message", fn);
      return () => window.removeEventListener("message", fn);
    },
  };
}
