"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  Plug,
  Unplug,
  Trash2,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  trackToolSuccess,
  trackToolError,
} from "@/lib/analytics-events";

const TOOL_SLUG = "websocket-tester";

type Direction = "out" | "in" | "info" | "error";
type ConnState = "idle" | "connecting" | "open" | "closing" | "closed";

interface LogEntry {
  id: number;
  time: number; // epoch ms
  dir: Direction;
  text: string;
  size?: number;
}

/** One independent connection: its own socket, log and composer. */
interface Connection {
  id: number;
  url: string;
  protocols: string;
  state: ConnState;
  message: string;
  logs: LogEntry[];
  error: string;
  autoReconnect: boolean;
  heartbeatMs: number;
  heartbeatPayload: string;
}

const SAMPLE_URLS = [
  { label: "Postman echo", url: "wss://ws.postman-echo.com/raw" },
  { label: "Mock binance", url: "wss://stream.binance.com:9443/ws/btcusdt@trade" },
];

const STORAGE_KEY = "devbench:ws-tester:url";

const MAX_CONNS = 4;
const MAX_RECONNECT_ATTEMPTS = 8;
const HEARTBEAT_OPTIONS = [
  { ms: 0, label: "Off" },
  { ms: 5_000, label: "5s" },
  { ms: 15_000, label: "15s" },
  { ms: 30_000, label: "30s" },
  { ms: 60_000, label: "60s" },
];

const DIR_FILTERS = ["all", "out", "in", "info", "error"] as const;
type DirFilter = (typeof DIR_FILTERS)[number];

const FILTER_LABELS: Record<DirFilter, string> = {
  all: "All",
  out: "Sent",
  in: "Recv",
  info: "Info",
  error: "Error",
};

const STATE_DOT: Record<ConnState, string> = {
  idle: "bg-muted-foreground/30",
  connecting: "bg-amber-500",
  open: "bg-emerald-500",
  closing: "bg-orange-500",
  closed: "bg-rose-500",
};

function createConnection(id: number, url = ""): Connection {
  return {
    id,
    url,
    protocols: "",
    state: "idle",
    message: "",
    logs: [],
    error: "",
    autoReconnect: false,
    heartbeatMs: 0,
    heartbeatPayload: "ping",
  };
}

function shortenBytes(n?: number) {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function fmtTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
}

/** Tab label: the URL without its scheme, truncated so tabs stay narrow. */
function shortUrl(u: string) {
  const s = u.replace(/^wss?:\/\//i, "");
  return s.length > 26 ? s.slice(0, 25) + "…" : s;
}

export default function WebSocketTesterTool({ tool }: { tool: Tool }) {
  const [conns, setConns] = useState<Connection[]>(() => [createConnection(0)]);
  const [activeId, setActiveId] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterDir, setFilterDir] = useState<DirFilter>("all");
  const [filterText, setFilterText] = useState("");
  const [jsonHint, setJsonHint] = useState<{ ok: boolean; text: string } | null>(null);

  const nextIdRef = useRef(1);
  const connsRef = useRef(conns);
  const socketsRef = useRef(new Map<number, WebSocket>());
  const hbTimersRef = useRef(new Map<number, number>());
  const reconnTimersRef = useRef(new Map<number, number>());
  const attemptRef = useRef(new Map<number, number>());
  const manualCloseRef = useRef(new Set<number>());
  const logIdRef = useRef(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // The active connection — conns never goes empty (the last tab cannot close).
  const active = conns.find((c) => c.id === activeId) ?? conns[0];

  // Keep a ref mirror so socket callbacks (which fire long after this render)
  // always see the latest connection settings.
  useEffect(() => {
    connsRef.current = conns;
  }, [conns]);

  const patchConn = useCallback((id: number, patch: Partial<Connection>) => {
    setConns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const appendLog = useCallback((id: number, dir: Direction, text: string, size?: number) => {
    setConns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, logs: [...c.logs, { id: ++logIdRef.current, time: Date.now(), dir, text, size }] }
          : c,
      ),
    );
  }, []);

  // Hydrate the first connection's URL from localStorage on mount. setState
  // here is correct: one-shot synchronisation from an external source.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) patchConn(0, { url: stored });
    } catch { /* ignore */ }
  }, [patchConn]);

  // Auto-scroll the frame log to the bottom on new entries
  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active.logs, autoScroll]);

  const stopHeartbeat = useCallback((id: number) => {
    const t = hbTimersRef.current.get(id);
    if (t !== undefined) {
      window.clearInterval(t);
      hbTimersRef.current.delete(id);
    }
  }, []);

  const clearReconnect = useCallback((id: number) => {
    const t = reconnTimersRef.current.get(id);
    if (t !== undefined) {
      window.clearTimeout(t);
      reconnTimersRef.current.delete(id);
    }
  }, []);

  /**
   * Periodically send a keep-alive payload so chatty servers do not time the
   * socket out. Logged as INFO (not a sent frame) so traffic stats stay
   * meaningful. Reads the latest payload from connsRef on every tick, so
   * editing it while running takes effect immediately.
   */
  const startHeartbeat = useCallback(
    (id: number, ms: number) => {
      stopHeartbeat(id);
      if (ms <= 0) return;
      const t = window.setInterval(() => {
        const ws = socketsRef.current.get(id);
        const conn = connsRef.current.find((c) => c.id === id);
        if (!ws || ws.readyState !== WebSocket.OPEN || !conn) return;
        const payload = conn.heartbeatPayload.trim() || "ping";
        try {
          ws.send(payload);
          appendLog(id, "info", `♥ heartbeat sent ("${payload}")`);
        } catch { /* ignore */ }
      }, ms);
      hbTimersRef.current.set(id, t);
    },
    [appendLog, stopHeartbeat],
  );

  const doConnect = (id: number, isRetry = false) => {
    const conn = connsRef.current.find((c) => c.id === id);
    if (!conn) return;
    const trimmed = conn.url.trim();
    if (!trimmed) {
      patchConn(id, { error: "Enter a WebSocket URL (ws:// or wss://)." });
      return;
    }
    if (!/^wss?:\/\//i.test(trimmed)) {
      patchConn(id, { error: "URL must start with ws:// or wss://" });
      return;
    }

    // Replace any previous socket for this tab. The old socket's close must
    // not be mistaken for a drop we should auto-reconnect (flag consumed by
    // its own handler, which is ignored once replaced — see onclose guard).
    const prev = socketsRef.current.get(id);
    if (prev) {
      if (prev.readyState !== WebSocket.CLOSED) manualCloseRef.current.add(id);
      try { prev.close(); } catch { /* ignore */ }
      socketsRef.current.delete(id);
    }
    clearReconnect(id);
    // A retry must keep the attempt counter so the backoff actually backs
    // off; only a fresh user-initiated connect starts a new sequence.
    if (!isRetry) attemptRef.current.delete(id);

    try {
      const protoArr = conn.protocols.split(",").map((s) => s.trim()).filter(Boolean);
      const ws = protoArr.length ? new WebSocket(trimmed, protoArr) : new WebSocket(trimmed);
      socketsRef.current.set(id, ws);
      // Every handler ignores events from a socket that is no longer current.
      const isCurrent = () => socketsRef.current.get(id) === ws;
      patchConn(id, { state: "connecting", error: "" });
      appendLog(id, "info", `Connecting to ${trimmed}${protoArr.length ? ` (subprotocols: ${protoArr.join(", ")})` : ""}…`);

      ws.onopen = () => {
        if (!isCurrent()) return;
        attemptRef.current.delete(id);
        patchConn(id, { state: "open" });
        appendLog(id, "info", `✓ Connected. Protocol: ${ws.protocol || "(none)"}`);
        try { localStorage.setItem(STORAGE_KEY, trimmed); } catch { /* ignore */ }
        const cur = connsRef.current.find((c) => c.id === id);
        if (cur && cur.heartbeatMs > 0) startHeartbeat(id, cur.heartbeatMs);
        trackToolSuccess(TOOL_SLUG, "connect");
      };
      ws.onmessage = async (ev) => {
        if (!isCurrent()) return;
        let text: string;
        let size: number | undefined;
        if (typeof ev.data === "string") {
          text = ev.data;
          size = new Blob([ev.data]).size;
        } else if (ev.data instanceof Blob) {
          size = ev.data.size;
          // Render as text if it looks like text, else as hex preview
          try {
            text = await ev.data.text();
            if (text.length > 5000) text = text.slice(0, 5000) + "…[truncated]";
          } catch {
            text = `[Binary blob ${size} bytes]`;
          }
        } else if (ev.data instanceof ArrayBuffer) {
          size = ev.data.byteLength;
          const bytes = new Uint8Array(ev.data);
          const hex = [...bytes.slice(0, 64)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
          text = `[ArrayBuffer ${size} bytes] ${hex}${size > 64 ? "…" : ""}`;
        } else {
          text = String(ev.data);
        }
        appendLog(id, "in", text, size);
      };
      ws.onerror = () => {
        if (!isCurrent()) return;
        appendLog(id, "error", "WebSocket error event (browser hides details for security).");
        trackToolError(TOOL_SLUG, "connect", "websocket error");
      };
      ws.onclose = (ev) => {
        if (!isCurrent()) {
          // A replaced socket winding down — swallow the manual-close flag.
          manualCloseRef.current.delete(id);
          return;
        }
        socketsRef.current.delete(id);
        stopHeartbeat(id);
        patchConn(id, { state: "closed" });
        appendLog(id, "info", `Connection closed. Code: ${ev.code}${ev.reason ? ` · Reason: "${ev.reason}"` : ""}${ev.wasClean ? " (clean)" : " (not clean)"}`);

        const manual = manualCloseRef.current.delete(id);
        const cur = connsRef.current.find((c) => c.id === id);
        if (manual || !cur?.autoReconnect) return;

        const attempt = (attemptRef.current.get(id) ?? 0) + 1;
        if (attempt > MAX_RECONNECT_ATTEMPTS) {
          attemptRef.current.delete(id);
          appendLog(id, "error", `Auto-reconnect gave up after ${MAX_RECONNECT_ATTEMPTS} attempts. Press Connect to retry.`);
          return;
        }
        attemptRef.current.set(id, attempt);
        const delay = Math.min(1000 * 2 ** (attempt - 1), 15_000);
        appendLog(id, "info", `↻ Auto-reconnect attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS} in ${delay / 1000}s…`);
        const t = window.setTimeout(() => {
          reconnTimersRef.current.delete(id);
          const next = connsRef.current.find((c) => c.id === id);
          if (next?.autoReconnect) doConnect(id, true);
        }, delay);
        reconnTimersRef.current.set(id, t);
      };
    } catch (e) {
      patchConn(id, { error: e instanceof Error ? e.message : "Failed to open WebSocket.", state: "idle" });
    }
  };

  const disconnect = (id: number) => {
    clearReconnect(id);
    attemptRef.current.delete(id);
    const ws = socketsRef.current.get(id);
    if (!ws) {
      patchConn(id, { state: "closed" });
      return;
    }
    manualCloseRef.current.add(id);
    patchConn(id, { state: "closing" });
    appendLog(id, "info", "Closing connection…");
    try { ws.close(1000, "user requested"); } catch { /* ignore */ }
  };

  const send = () => {
    const ws = socketsRef.current.get(activeId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      patchConn(activeId, { error: "Not connected. Open a connection first." });
      return;
    }
    const text = active.message;
    if (!text) return;
    try {
      ws.send(text);
      appendLog(activeId, "out", text, new Blob([text]).size);
      trackToolSuccess(TOOL_SLUG, "send_message");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "send failed";
      appendLog(activeId, "error", msg);
      trackToolError(TOOL_SLUG, "send_message", msg);
    }
  };

  // Send on ⌘+Enter
  const onMessageKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  const formatMessage = (mode: "pretty" | "minify") => {
    const src = active.message;
    if (!src.trim()) return;
    try {
      const parsed: unknown = JSON.parse(src);
      patchConn(active.id, {
        message: mode === "pretty" ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed),
      });
      setJsonHint({ ok: true, text: mode === "pretty" ? "Formatted" : "Minified" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "parse failed";
      setJsonHint({ ok: false, text: `Invalid JSON: ${msg}` });
    }
  };

  const addConnection = () => {
    if (conns.length >= MAX_CONNS) return;
    const id = nextIdRef.current++;
    setConns((prev) => [...prev, createConnection(id)]);
    setActiveId(id);
    setJsonHint(null);
  };

  const closeConnection = (id: number) => {
    if (conns.length <= 1) return;
    const ws = socketsRef.current.get(id);
    if (ws) {
      manualCloseRef.current.add(id);
      try { ws.close(1000, "tab closed"); } catch { /* ignore */ }
      socketsRef.current.delete(id);
    }
    stopHeartbeat(id);
    clearReconnect(id);
    attemptRef.current.delete(id);
    const idx = conns.findIndex((c) => c.id === id);
    const neighbour = conns[idx + 1] ?? conns[idx - 1];
    setConns((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id && neighbour) setActiveId(neighbour.id);
    setJsonHint(null);
  };

  const setHeartbeat = (ms: number) => {
    patchConn(activeId, { heartbeatMs: ms });
    if (active.state === "open") {
      if (ms > 0) startHeartbeat(activeId, ms);
      else stopHeartbeat(activeId);
    }
  };

  const toggleAutoReconnect = (on: boolean) => {
    patchConn(activeId, { autoReconnect: on });
    if (!on) clearReconnect(activeId);
  };

  // Clean up every socket and timer on unmount. The maps themselves are
  // stable (mutated in place, never replaced), so copying the references
  // inside the effect is the same object the cleanup will see.
  useEffect(() => {
    const sockets = socketsRef.current;
    const hbTimers = hbTimersRef.current;
    const reconnTimers = reconnTimersRef.current;
    return () => {
      for (const ws of sockets.values()) {
        try { ws.close(); } catch { /* ignore */ }
      }
      // Clear first so the late close events hit the stale-socket guard and
      // never schedule a reconnect on an unmounted component.
      sockets.clear();
      for (const t of hbTimers.values()) window.clearInterval(t);
      for (const t of reconnTimers.values()) window.clearTimeout(t);
    };
  }, []);

  const exportLogs = () => {
    if (active.logs.length === 0) return;
    const lines = active.logs.map((l) => {
      const dirLabel = l.dir === "out" ? "→ SENT" : l.dir === "in" ? "← RECV" : l.dir === "error" ? "! ERR " : "· INFO";
      return `[${fmtTime(l.time)}] ${dirLabel}${l.size != null ? ` (${shortenBytes(l.size)})` : ""}\n${l.text}\n`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `ws-log-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const stats = {
    sent: active.logs.filter((l) => l.dir === "out").length,
    received: active.logs.filter((l) => l.dir === "in").length,
  };

  const dirCounts: Record<DirFilter, number> = {
    all: active.logs.length,
    out: 0,
    in: 0,
    info: 0,
    error: 0,
  };
  for (const l of active.logs) dirCounts[l.dir]++;

  const query = filterText.trim().toLowerCase();
  const visibleLogs = active.logs.filter(
    (l) => (filterDir === "all" || l.dir === filterDir) && (!query || l.text.toLowerCase().includes(query)),
  );
  const filtering = filterDir !== "all" || query.length > 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="space-y-4">
        {/* Connection (with tabs for multiple parallel sockets) */}
        <section className="rounded-2xl border border-border bg-card">
          <div
            className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 pb-1.5 pt-2"
            role="group"
            aria-label="Connections"
          >
            {conns.map((c, i) => {
              const isActive = c.id === activeId;
              return (
                <div
                  key={c.id}
                  className={`flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs ${
                    isActive
                      ? "border-border bg-muted/60 font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(c.id);
                      setJsonHint(null);
                    }}
                    aria-current={isActive}
                    className="flex items-center gap-1.5"
                  >
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${STATE_DOT[c.state]}`} />
                    Conn {i + 1}
                    {c.url && <span className="max-w-40 truncate font-mono text-[11px] opacity-70">{shortUrl(c.url)}</span>}
                  </button>
                  {conns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => closeConnection(c.id)}
                      aria-label={`Close connection ${i + 1}`}
                      className="rounded p-0.5 hover:bg-muted"
                    >
                      <X aria-hidden="true" className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={addConnection}
              disabled={conns.length >= MAX_CONNS}
              aria-label="New connection"
              title={conns.length >= MAX_CONNS ? `Maximum of ${MAX_CONNS} connections` : "Open another connection"}
              className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          <div className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Connection</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
              <div>
                <label htmlFor="ws-url" className="mb-1 block text-xs font-medium text-muted-foreground">
                  URL
                </label>
                <input
                  id="ws-url"
                  type="text"
                  value={active.url}
                  onChange={(e) => patchConn(activeId, { url: e.target.value })}
                  placeholder="wss://echo.example.com"
                  spellCheck={false}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <label htmlFor="ws-protocols" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Subprotocols (optional)
                </label>
                <input
                  id="ws-protocols"
                  type="text"
                  value={active.protocols}
                  onChange={(e) => patchConn(activeId, { protocols: e.target.value })}
                  placeholder="graphql-ws, json"
                  spellCheck={false}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div className="flex items-end gap-2">
                {active.state === "open" || active.state === "connecting" || active.state === "closing" ? (
                  <button
                    onClick={() => disconnect(activeId)}
                    disabled={active.state === "closing"}
                    className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-40"
                  >
                    <Unplug aria-hidden="true" className="h-4 w-4" />
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => doConnect(activeId)}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
                  >
                    <Plug aria-hidden="true" className="h-4 w-4" />
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Quick URLs */}
            {!active.url && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {SAMPLE_URLS.map((s) => (
                  <button
                    key={s.url}
                    onClick={() => patchConn(activeId, { url: s.url })}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Status pill + resilience controls */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${
                  active.state === "open"
                    ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                    : active.state === "connecting"
                      ? "bg-amber-500/10 text-amber-800 dark:text-amber-400"
                      : active.state === "closing"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : active.state === "closed"
                          ? "bg-rose-500/10 text-rose-800 dark:text-rose-400"
                          : "bg-muted text-muted-foreground"
                }`}
              >
                {active.state === "open" ? <CheckCircle2 aria-hidden="true" className="h-3 w-3" /> : <AlertCircle aria-hidden="true" className="h-3 w-3" />}
                {active.state}
              </span>
              <span className="text-muted-foreground">↑ {stats.sent} sent · ↓ {stats.received} received</span>
              <label className="flex items-center gap-1.5 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={active.autoReconnect}
                  onChange={(e) => toggleAutoReconnect(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                Auto-reconnect
              </label>
              <label className="flex items-center gap-1.5 text-muted-foreground">
                Heartbeat
                <select
                  value={active.heartbeatMs}
                  onChange={(e) => setHeartbeat(Number(e.target.value))}
                  aria-label="Heartbeat interval"
                  className="rounded-md border border-border bg-background px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {HEARTBEAT_OPTIONS.map((o) => (
                    <option key={o.ms} value={o.ms}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-muted-foreground">
                payload
                <input
                  type="text"
                  value={active.heartbeatPayload}
                  onChange={(e) => patchConn(activeId, { heartbeatPayload: e.target.value })}
                  placeholder="ping"
                  spellCheck={false}
                  aria-label="Heartbeat payload"
                  className="w-32 rounded-md border border-border bg-background px-1.5 py-1 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
            </div>

            {active.error && (
              <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                {active.error}
              </p>
            )}
          </div>
        </section>

        {/* Send */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Send a message</h2>
            <span className="text-xs text-muted-foreground">to Conn {conns.findIndex((c) => c.id === activeId) + 1}</span>
          </div>
          <label htmlFor="ws-message" className="sr-only">Message to send</label>
          <textarea
            id="ws-message"
            value={active.message}
            onChange={(e) => {
              patchConn(activeId, { message: e.target.value });
              if (jsonHint) setJsonHint(null);
            }}
            onKeyDown={onMessageKeyDown}
            placeholder='{"type": "ping"} — or any text. ⌘/Ctrl+Enter to send.'
            spellCheck={false}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {new Blob([active.message]).size} bytes · ⌘+Enter to send
              {jsonHint && (
                <>
                  {" · "}
                  <span className={jsonHint.ok ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
                    {jsonHint.text}
                  </span>
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => formatMessage("pretty")}
                disabled={!active.message.trim()}
                title="Pretty-print JSON"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                Format
              </button>
              <button
                onClick={() => formatMessage("minify")}
                disabled={!active.message.trim()}
                title="Minify JSON to one line"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                Minify
              </button>
              <button
                onClick={send}
                disabled={!active.message || active.state !== "open"}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40"
              >
                <Send aria-hidden="true" className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </section>

        {/* Log */}
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="text-sm font-semibold">
              Frames ({active.logs.length}
              {filtering ? ` · showing ${visibleLogs.length}` : ""})
            </h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                Auto-scroll
              </label>
              <button
                onClick={exportLogs}
                disabled={active.logs.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Download aria-hidden="true" className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                onClick={() => patchConn(activeId, { logs: [] })}
                disabled={active.logs.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Frame filter */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2">
            {DIR_FILTERS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilterDir(d)}
                aria-pressed={filterDir === d}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  filterDir === d
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {FILTER_LABELS[d]} {dirCounts[d]}
              </button>
            ))}
            <input
              type="search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search frames…"
              aria-label="Search frames"
              className="ml-auto h-7 w-44 rounded-md border border-border bg-background px-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div
            ref={scrollerRef}
            className="max-h-[420px] min-h-[200px] overflow-auto px-4 py-3 font-mono text-xs"
          >
            {active.logs.length === 0 ? (
              <p className="text-center text-muted-foreground">No frames yet. Connect and send a message.</p>
            ) : visibleLogs.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No frames match the filter ({active.logs.length} hidden).
              </p>
            ) : (
              <ul className="space-y-1.5">
                {visibleLogs.map((l) => (
                  <li
                    key={l.id}
                    className={`rounded-md border px-2.5 py-1.5 ${
                      l.dir === "out"
                        ? "border-blue-500/20 bg-blue-500/5"
                        : l.dir === "in"
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : l.dir === "error"
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="mb-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-semibold">
                        {l.dir === "out" ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400"><ArrowUpFromLine aria-hidden="true" className="h-3 w-3" /> SENT</span>
                        ) : l.dir === "in" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><ArrowDownToLine aria-hidden="true" className="h-3 w-3" /> RECV</span>
                        ) : l.dir === "error" ? (
                          <span className="text-destructive">ERROR</span>
                        ) : (
                          <span>INFO</span>
                        )}
                      </span>
                      <span>{fmtTime(l.time)}</span>
                      {l.size != null && <span>{shortenBytes(l.size)}</span>}
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-foreground/90">{l.text}</pre>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          WebSocket connections are made directly from your browser to the target server. Some servers reject browser origins (CORS-like behaviour) — if you see an immediate close with code 1006, that&apos;s usually why.
        </p>
      </div>
    </main>
  );
}
