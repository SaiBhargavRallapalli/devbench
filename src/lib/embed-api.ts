// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Embed v2 — postMessage protocol between parent page and /embed/[slug] iframe.
 *
 * Parent → iframe: DEVBENCH_EMBED_CMD
 * iframe → parent: DEVBENCH_EMBED_EVT
 */

export const EMBED_MSG_SOURCE = "devbench-embed" as const;

/** Max chars accepted on SET_INPUT (per field). */
export const EMBED_MAX_INPUT_CHARS = 512 * 1024;

/** Max chars echoed to parent in OUTPUT / STATE (output field). */
export const EMBED_MAX_ECHO_CHARS = 512 * 1024;

/** Max chars echoed for error strings. */
export const EMBED_MAX_ERROR_CHARS = 4096;

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

const EMBED_THEMES = new Set<EmbedTheme>(["light", "dark", "auto"]);

function clampString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  if (value.length > max) return null;
  return value;
}

export function truncateEmbedField(
  text: string,
  max: number,
  label = "output",
): string {
  if (text.length <= max) return text;
  return (
    text.slice(0, max) +
    `\n… [truncated — ${text.length.toLocaleString()} chars total; open full tool for complete ${label}]`
  );
}

/** Validate and normalize CONFIGURE payloads. Returns null when invalid. */
export function normalizeEmbedConfig(raw: unknown): EmbedConfig | null {
  if (raw === undefined) return {};
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const config: EmbedConfig = {};
  if (o.theme !== undefined) {
    if (typeof o.theme !== "string" || !EMBED_THEMES.has(o.theme as EmbedTheme)) {
      return null;
    }
    config.theme = o.theme as EmbedTheme;
  }
  if (o.autoRun !== undefined) {
    if (typeof o.autoRun !== "boolean") return null;
    config.autoRun = o.autoRun;
  }
  return config;
}

/**
 * Strict command parser — rejects malformed payloads and oversize strings.
 * Prefer this over {@link isEmbedCommand} on the iframe side.
 */
export function parseEmbedCommand(
  data: unknown,
): (EmbedCommand & { source: typeof EMBED_MSG_SOURCE }) | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.source !== EMBED_MSG_SOURCE) return null;

  switch (d.type) {
    case "SET_INPUT": {
      const input = clampString(d.input, EMBED_MAX_INPUT_CHARS);
      if (input === null) return null;
      const cmd: EmbedCommand & { source: typeof EMBED_MSG_SOURCE } = {
        source: EMBED_MSG_SOURCE,
        type: "SET_INPUT",
        input,
      };
      if (d.input2 !== undefined) {
        const input2 = clampString(d.input2, EMBED_MAX_INPUT_CHARS);
        if (input2 === null) return null;
        cmd.input2 = input2;
      }
      return cmd;
    }
    case "RUN":
    case "CLEAR":
    case "GET_STATE":
      return { source: EMBED_MSG_SOURCE, type: d.type };
    case "CONFIGURE": {
      const config = normalizeEmbedConfig(d.config);
      if (config === null) return null;
      return { source: EMBED_MSG_SOURCE, type: "CONFIGURE", config };
    }
    default:
      return null;
  }
}

/** @deprecated Use {@link parseEmbedCommand} for strict validation. */
export function isEmbedCommand(
  data: unknown,
): data is EmbedCommand & { source: typeof EMBED_MSG_SOURCE } {
  return parseEmbedCommand(data) !== null;
}

export function clampEmbedOutboundEvent(evt: EmbedEvent): EmbedEvent {
  switch (evt.type) {
    case "OUTPUT":
      return {
        type: "OUTPUT",
        output: truncateEmbedField(evt.output, EMBED_MAX_ECHO_CHARS),
        error: truncateEmbedField(evt.error, EMBED_MAX_ERROR_CHARS, "error"),
      };
    case "STATE":
      return {
        type: "STATE",
        input: truncateEmbedField(evt.input, EMBED_MAX_INPUT_CHARS, "input"),
        input2: truncateEmbedField(evt.input2, EMBED_MAX_INPUT_CHARS, "input"),
        output: truncateEmbedField(evt.output, EMBED_MAX_ECHO_CHARS),
        error: truncateEmbedField(evt.error, EMBED_MAX_ERROR_CHARS, "error"),
      };
    case "RESIZE": {
      const height =
        typeof evt.height === "number" && Number.isFinite(evt.height)
          ? Math.max(0, Math.min(Math.round(evt.height), 10_000))
          : 0;
      return { type: "RESIZE", height };
    }
    default:
      return evt;
  }
}

export function postEmbedCommand(target: Window, cmd: EmbedCommand, origin = "*"): void {
  target.postMessage({ source: EMBED_MSG_SOURCE, ...cmd }, origin);
}

export function postEmbedEvent(parent: Window, evt: EmbedEvent, origin = "*"): void {
  parent.postMessage(
    { source: EMBED_MSG_SOURCE, ...clampEmbedOutboundEvent(evt) },
    origin,
  );
}

/** True when the message came from the direct parent frame (embed iframe guard). */
export function isEmbedMessageFromParent(ev: MessageEvent): boolean {
  return ev.source === window.parent && window.parent !== window;
}

/** Helper for host pages embedding DevBench tools */
export function createEmbedController(iframe: HTMLIFrameElement) {
  return {
    setInput(input: string, input2?: string) {
      if (!iframe.contentWindow) return;
      if (input.length > EMBED_MAX_INPUT_CHARS) return;
      if (input2 !== undefined && input2.length > EMBED_MAX_INPUT_CHARS) return;
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
      if (normalizeEmbedConfig(config) === null) return;
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
