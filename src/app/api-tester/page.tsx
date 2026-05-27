"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send, Copy, Check, Trash2, Plus, X, ChevronDown, Clock, Server,
  FileText, Code2, Shield, Loader2, AlertCircle, Globe, Lock, Braces,
  Radio, Unplug, PlugZap, Share2, Workflow, FileUp, PanelLeft,
  FolderOpen, Folder, History, Save, Key, Eye, EyeOff, ChevronRight,
  MoreHorizontal, Settings2, Boxes, Wand2, Search,
} from "lucide-react";
import type { Socket as IoSocket } from "socket.io-client";
import Header from "@/components/Header";
import ApiImportPanel, { type ApiImportApply } from "@/components/ApiImportPanel";
import type { ImportedRequest } from "@/lib/api-import";
import { trackToolSuccess, trackToolError } from "@/lib/analytics-events";

const TOOL_SLUG = "api-tester";

// ─── Types ───────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type BodyType = "none" | "json" | "form" | "xml" | "raw";
type AuthType = "none" | "bearer" | "basic" | "apikey" | "custom";
type TransportMode = "http" | "websocket" | "socketio" | "graphql" | "grpc";
type ReqTab = "params" | "body" | "auth" | "headers" | "subprotocols" | "graphqlOp" | "graphqlVars" | "grpcJson" | "socketioOpts";
type ResTab = "body" | "headers" | "raw" | "timing" | "code";
type WsStatus = "idle" | "connecting" | "open" | "closed" | "error";

interface KVPair { id: string; key: string; value: string; enabled: boolean; }
interface EnvVar { id: string; key: string; value: string; enabled: boolean; }
interface WsLogEntry { id: string; t: number; kind: "sent" | "received" | "system"; text: string; }

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  time: number;
  size: number;
  redirected: boolean;
  finalUrl: string;
}

interface TabState {
  id: string;
  name: string;
  transportMode: TransportMode;
  method: HttpMethod;
  url: string;
  params: KVPair[];
  customHeaders: KVPair[];
  bodyType: BodyType;
  bodyContent: string;
  formPairs: KVPair[];
  authType: AuthType;
  bearerToken: string;
  basicUser: string;
  basicPass: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyAddTo: "header" | "query";
  customAuth: string;
  graphqlQuery: string;
  graphqlVariables: string;
  graphqlOpName: string;
  grpcJsonBody: string;
  wsSubprotocols: string;
  socketIoPath: string;
  socketIoAuthJson: string;
  socketIoPollingOnly: boolean;
  reqTab: ReqTab;
  response: ApiResponse | null;
  resError: string;
  loading: boolean;
  resTab: ResTab;
  codeLang: string;
}

interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  transportMode: TransportMode;
  tab: Partial<TabState>;
}

interface Collection {
  id: string;
  name: string;
  requests: SavedRequest[];
  expanded: boolean;
}

interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  time: number;
  ts: number;
  tab?: Partial<TabState>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-500",
  POST: "text-amber-500",
  PUT: "text-blue-500",
  PATCH: "text-violet-500",
  DELETE: "text-red-500",
  HEAD: "text-cyan-500",
  OPTIONS: "text-pink-500",
};

const METHOD_BG: Record<HttpMethod, string> = {
  GET: "bg-emerald-500",
  POST: "bg-amber-500",
  PUT: "bg-blue-500",
  PATCH: "bg-violet-500",
  DELETE: "bg-red-500",
  HEAD: "bg-cyan-500",
  OPTIONS: "bg-pink-500",
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}
function emptyKV(): KVPair {
  return { id: uid(), key: "", value: "", enabled: true };
}
function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
function statusColor(c: number): string {
  if (c < 300) return "text-emerald-500";
  if (c < 400) return "text-amber-500";
  return "text-red-500";
}
function statusBg(c: number): string {
  if (c < 300) return "bg-emerald-500/10 border-emerald-500/20";
  if (c < 400) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}
function tryFmtJson(s: string): string {
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}
function tryFmtXml(text: string): string {
  try {
    let out = "", indent = 0;
    for (const part of text.replace(/>\s*</g, ">\n<").split("\n")) {
      if (part.match(/^<\/\w/)) indent--;
      out += "  ".repeat(Math.max(0, indent)) + part.trim() + "\n";
      if (part.match(/^<\w[^>]*[^/]>$/)) indent++;
    }
    return out.trim();
  } catch { return text; }
}
function subEnv(text: string, vars: EnvVar[]): string {
  let r = text;
  for (const v of vars.filter(v => v.enabled && v.key.trim())) {
    r = r.replaceAll(`{{${v.key}}}`, v.value);
  }
  return r;
}
function hasEnvVars(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

// LocalStorage helpers
function saveLS<T>(k: string, v: T) {
  try { localStorage.setItem(`devbench-api:${k}`, JSON.stringify(v)); } catch {}
}
function loadLS<T>(k: string, fb: T): T {
  try {
    const raw = localStorage.getItem(`devbench-api:${k}`);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {}
  return fb;
}

// JSON syntax highlighter — safe, regex-based
function highlightJson(str: string): string {
  const s = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return s.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (m) => {
      if (/^"/.test(m)) {
        if (/:$/.test(m)) return `<span class="text-violet-400">${m}</span>`;
        return `<span class="text-amber-300">${m}</span>`;
      }
      if (/true|false/.test(m)) return `<span class="text-emerald-400">${m}</span>`;
      if (/null/.test(m)) return `<span class="text-slate-500">${m}</span>`;
      return `<span class="text-blue-400">${m}</span>`;
    }
  );
}

// Code generation
function genCode(lang: string, method: HttpMethod, url: string, headers: Record<string, string>, body?: string): string {
  const hasBody = body && !["GET", "HEAD"].includes(method);
  const hEntries = Object.entries(headers).filter(([k]) => k.trim());
  switch (lang) {
    case "curl": {
      let c = `curl -X ${method} "${url}"`;
      for (const [k, v] of hEntries) c += ` \\\n  -H "${k}: ${v}"`;
      if (hasBody) c += ` \\\n  -d '${body}'`;
      return c;
    }
    case "javascript": {
      let c = `const response = await fetch("${url}", {\n  method: "${method}",\n`;
      if (hEntries.length) c += `  headers: {\n${hEntries.map(([k, v]) => `    "${k}": "${v}"`).join(",\n")}\n  },\n`;
      if (hasBody) c += `  body: ${JSON.stringify(body)},\n`;
      return c + `});\nconst data = await response.json();\nconsole.log(data);`;
    }
    case "python": {
      let c = `import requests\n\nresponse = requests.${method.toLowerCase()}(\n  "${url}",\n`;
      if (hEntries.length) c += `  headers={\n${hEntries.map(([k, v]) => `    "${k}": "${v}"`).join(",\n")}\n  },\n`;
      if (hasBody) c += `  data='${body}',\n`;
      return c + `)\nprint(response.status_code)\nprint(response.json())`;
    }
    case "node": {
      let c = `const https = require('https');\nconst url = new URL("${url}");\nconst options = {\n  hostname: url.hostname,\n  path: url.pathname + url.search,\n  method: "${method}",\n`;
      if (hEntries.length) c += `  headers: {\n${hEntries.map(([k, v]) => `    "${k}": "${v}"`).join(",\n")}\n  },\n`;
      c += `};\nconst req = https.request(options, (res) => {\n  let data = "";\n  res.on("data", (c) => data += c);\n  res.on("end", () => console.log(res.statusCode, data));\n});\n`;
      if (hasBody) c += `req.write('${body}');\n`;
      return c + `req.end();`;
    }
    case "php": {
      let c = `<?php\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, "${url}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n`;
      if (hEntries.length) c += `curl_setopt($ch, CURLOPT_HTTPHEADER, [\n${hEntries.map(([k, v]) => `  "${k}: ${v}"`).join(",\n")}\n]);\n`;
      if (hasBody) c += `curl_setopt($ch, CURLOPT_POSTFIELDS, '${body}');\n`;
      return c + `$r = curl_exec($ch);\necho curl_getinfo($ch, CURLINFO_HTTP_CODE);\necho $r;\ncurl_close($ch);`;
    }
    case "java": {
      let c = `import java.net.http.*;\nimport java.net.URI;\nvar client = HttpClient.newHttpClient();\nvar request = HttpRequest.newBuilder()\n  .uri(URI.create("${url}"))\n  .method("${method}", `;
      c += hasBody ? `HttpRequest.BodyPublishers.ofString("${body?.replace(/"/g, '\\"')}"))\n` : `HttpRequest.BodyPublishers.noBody())\n`;
      for (const [k, v] of hEntries) c += `  .header("${k}", "${v}")\n`;
      return c + `  .build();\nvar resp = client.send(request, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(resp.statusCode());\nSystem.out.println(resp.body());`;
    }
    case "csharp": {
      let c = `using var client = new HttpClient();\nvar request = new HttpRequestMessage(HttpMethod.${method.charAt(0) + method.slice(1).toLowerCase()}, "${url}");\n`;
      for (const [k, v] of hEntries) c += `request.Headers.Add("${k}", "${v}");\n`;
      if (hasBody) c += `request.Content = new StringContent("${body?.replace(/"/g, '\\"')}");\n`;
      return c + `var response = await client.SendAsync(request);\nvar body = await response.Content.ReadAsStringAsync();\nConsole.WriteLine($"{(int)response.StatusCode}");\nConsole.WriteLine(body);`;
    }
    default: return "";
  }
}

// ─── Default tab ─────────────────────────────────────────────────────────────

function defaultTab(id?: string, name?: string): TabState {
  return {
    id: id ?? uid(), name: name ?? "New Request",
    transportMode: "http", method: "GET", url: "",
    params: [emptyKV()], customHeaders: [emptyKV()],
    bodyType: "none", bodyContent: '{\n  "key": "value"\n}', formPairs: [emptyKV()],
    authType: "none", bearerToken: "", basicUser: "", basicPass: "",
    apiKeyKey: "X-API-Key", apiKeyValue: "", apiKeyAddTo: "header", customAuth: "",
    graphqlQuery: "query {\n  __typename\n}", graphqlVariables: "{}", graphqlOpName: "",
    grpcJsonBody: "{}", wsSubprotocols: "",
    socketIoPath: "/socket.io", socketIoAuthJson: "{}", socketIoPollingOnly: false,
    reqTab: "params", response: null, resError: "", loading: false, resTab: "body", codeLang: "curl",
  };
}

// ─── Small components ─────────────────────────────────────────────────────────

function CopyBtn({ text, label, size = "sm" }: { text: string; label?: string; size?: "sm" | "xs" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { void navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className={`inline-flex items-center gap-1 rounded font-medium transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground ${size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      {label ?? (copied ? "Copied!" : "Copy")}
    </button>
  );
}

function PasswordInput({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex-1">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className ?? ""} pr-8`}
      />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function KVTable({ pairs, onChange, keyPh = "Key", valPh = "Value", secretValues }: {
  pairs: KVPair[];
  onChange: (p: KVPair[]) => void;
  keyPh?: string;
  valPh?: string;
  secretValues?: boolean;
}) {
  const update = (id: string, f: keyof KVPair, v: string | boolean) =>
    onChange(pairs.map(p => p.id === id ? { ...p, [f]: v } : p));
  const remove = (id: string) => onChange(pairs.filter(p => p.id !== id));
  const add = () => onChange([...pairs, emptyKV()]);
  const inputCls = "flex-1 px-2.5 py-1.5 text-xs rounded border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground/35 transition-opacity";

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[1.25rem_1fr_1fr_1.5rem] gap-1.5 mb-0.5 px-0.5">
        <div />
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{keyPh}</div>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{valPh}</div>
        <div />
      </div>
      {pairs.map(p => (
        <div key={p.id} className="grid grid-cols-[1.25rem_1fr_1fr_1.5rem] gap-1.5 group items-center">
          <input type="checkbox" checked={p.enabled} onChange={e => update(p.id, "enabled", e.target.checked)}
            className="rounded w-3.5 h-3.5 accent-accent" />
          <input type="text" value={p.key} onChange={e => update(p.id, "key", e.target.value)}
            placeholder={keyPh} className={`${inputCls} ${!p.enabled ? "opacity-40" : ""}`} />
          {secretValues ? (
            <PasswordInput value={p.value} onChange={v => update(p.id, "value", v)}
              placeholder={valPh} className={`${inputCls} ${!p.enabled ? "opacity-40" : ""}`} />
          ) : (
            <input type="text" value={p.value} onChange={e => update(p.id, "value", e.target.value)}
              placeholder={valPh} className={`${inputCls} ${!p.enabled ? "opacity-40" : ""}`} />
          )}
          <button onClick={() => remove(p.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors mt-1">
        <Plus className="w-3 h-3" /> Add row
      </button>
    </div>
  );
}

function TimingStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
      <p className={`text-base font-bold font-mono ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ApiTesterPage() {
  // ── Global state ──────────────────────────────────────────────────────────
  const [tabs, setTabs] = useState<TabState[]>(() => [defaultTab()]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collections, setCollections] = useState<Collection[]>(() => loadLS("collections", []));
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadLS("history", []));
  const [envVars, setEnvVars] = useState<EnvVar[]>(() => loadLS("envVars", [emptyKV()]));
  const [showEnvPanel, setShowEnvPanel] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveCollId, setSaveCollId] = useState("");
  const [saveReqName, setSaveReqName] = useState("");
  const [newCollName, setNewCollName] = useState("");
  const [showNewColl, setShowNewColl] = useState(false);
  const [splitPct, setSplitPct] = useState(42);
  const [histSearch, setHistSearch] = useState("");

  // WS / SIO refs (shared across tab switches — disconnect on tab change if needed)
  const wsRef = useRef<WebSocket | null>(null);
  const sioRef = useRef<IoSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<WsStatus>("idle");
  const [wsLog, setWsLog] = useState<WsLogEntry[]>([]);
  const [wsOutgoing, setWsOutgoing] = useState("");
  const [sioStatus, setSioStatus] = useState<WsStatus>("idle");
  const [sioLog, setSioLog] = useState<WsLogEntry[]>([]);
  const [sioOutgoing, setSioOutgoing] = useState("");
  const [sioEvent, setSioEvent] = useState("message");

  const workspaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startY: 0, startPct: 42 });
  const methodMenuRef = useRef<HTMLDivElement>(null);
  const [showMethodMenu, setShowMethodMenu] = useState(false);
  const [showTabMenu, setShowTabMenu] = useState<string | null>(null);

  // ── Active tab accessors ──────────────────────────────────────────────────
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) ?? tabs[0]!, [tabs, activeTabId]);

  const upd = useCallback((patch: Partial<TabState>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...patch } : t));
  }, [activeTabId]);

  // Persist collections/history to localStorage
  useEffect(() => { saveLS("collections", collections); }, [collections]);
  useEffect(() => { saveLS("history", history.slice(0, 50)); }, [history]);
  useEffect(() => { saveLS("envVars", envVars); }, [envVars]);

  // Close method menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (methodMenuRef.current && !methodMenuRef.current.contains(e.target as Node)) {
        setShowMethodMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Drag-to-resize split ──────────────────────────────────────────────────
  const onDragStart = useCallback((e: React.MouseEvent) => {
    dragRef.current = { active: true, startY: e.clientY, startPct: splitPct };
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.active) return;
      const h = workspaceRef.current?.clientHeight ?? 600;
      const delta = ((ev.clientY - dragRef.current.startY) / h) * 100;
      setSplitPct(Math.max(20, Math.min(75, dragRef.current.startPct + delta)));
    };
    const onUp = () => {
      dragRef.current.active = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [splitPct]);

  // ── Tab management ────────────────────────────────────────────────────────
  const addTab = useCallback((partial?: Partial<TabState>) => {
    const t = { ...defaultTab(), ...partial };
    setTabs(prev => [...prev, t]);
    setActiveTabId(t.id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex(t => t.id === id);
      const next = prev.filter(t => t.id !== id);
      if (id === activeTabId) {
        setActiveTabId(next[Math.max(0, idx - 1)]?.id ?? next[0]?.id ?? "");
      }
      return next;
    });
  }, [activeTabId]);

  // ── URL / header building ─────────────────────────────────────────────────
  const finalUrl = useMemo(() => {
    const raw = subEnv(activeTab.url.trim(), envVars);
    if (!raw) return "";
    try {
      const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      activeTab.params.filter(p => p.enabled && p.key.trim()).forEach(p => {
        u.searchParams.set(subEnv(p.key, envVars), subEnv(p.value, envVars));
      });
      return u.toString();
    } catch { return raw; }
  }, [activeTab.url, activeTab.params, envVars]);

  const wsTargetUrl = useMemo(() => {
    if (!activeTab.url.trim()) return "";
    try {
      let raw = subEnv(activeTab.url.trim(), envVars);
      if (!/^wss?:\/\//i.test(raw)) {
        if (/^https:\/\//i.test(raw)) raw = `wss://${raw.slice(8)}`;
        else if (/^http:\/\//i.test(raw)) raw = `ws://${raw.slice(7)}`;
        else raw = `wss://${raw}`;
      }
      const u = new URL(raw);
      activeTab.params.filter(p => p.enabled && p.key.trim()).forEach(p => u.searchParams.set(p.key, p.value));
      return u.toString();
    } catch { return ""; }
  }, [activeTab.url, activeTab.params, envVars]);

  const buildHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = {};
    activeTab.customHeaders.filter(p => p.enabled && p.key.trim()).forEach(p => {
      h[subEnv(p.key, envVars)] = subEnv(p.value, envVars);
    });
    const bt = activeTab.bodyType;
    if (bt === "json" && !h["Content-Type"]) h["Content-Type"] = "application/json";
    if (bt === "form" && !h["Content-Type"]) h["Content-Type"] = "application/x-www-form-urlencoded";
    if (bt === "xml" && !h["Content-Type"]) h["Content-Type"] = "application/xml";

    const at = activeTab.authType;
    if (at === "bearer" && activeTab.bearerToken.trim()) h["Authorization"] = `Bearer ${subEnv(activeTab.bearerToken, envVars)}`;
    if (at === "basic" && activeTab.basicUser.trim()) h["Authorization"] = `Basic ${btoa(`${activeTab.basicUser}:${activeTab.basicPass}`)}`;
    if (at === "custom" && activeTab.customAuth.trim()) h["Authorization"] = activeTab.customAuth;
    if (at === "apikey" && activeTab.apiKeyKey.trim() && activeTab.apiKeyAddTo === "header") {
      h[subEnv(activeTab.apiKeyKey, envVars)] = subEnv(activeTab.apiKeyValue, envVars);
    }
    return h;
  }, [activeTab, envVars]);

  const buildBody = useCallback((): string | undefined => {
    const { bodyType, bodyContent, formPairs, method } = activeTab;
    if (bodyType === "none" || ["GET", "HEAD"].includes(method)) return undefined;
    if (bodyType === "form") {
      const p = new URLSearchParams();
      formPairs.filter(f => f.enabled && f.key.trim()).forEach(f => p.set(f.key, f.value));
      return p.toString();
    }
    return bodyContent;
  }, [activeTab]);

  // ── Send request ──────────────────────────────────────────────────────────
  const pushHistory = useCallback((entry: Omit<HistoryEntry, "id" | "ts">) => {
    setHistory(prev => [{ ...entry, id: uid(), ts: Date.now() }, ...prev.slice(0, 49)]);
  }, []);

  const sendRequest = useCallback(async () => {
    if (!activeTab.url.trim()) return;
    upd({ loading: true, resError: "", response: null, resTab: "body" });
    try {
      const headers = buildHeaders();
      const payload = buildBody();
      const apiKeyInQuery = activeTab.authType === "apikey" && activeTab.apiKeyAddTo === "query" && activeTab.apiKeyKey.trim();
      let targetUrl = finalUrl;
      if (apiKeyInQuery) {
        try {
          const u = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
          u.searchParams.set(subEnv(activeTab.apiKeyKey, envVars), subEnv(activeTab.apiKeyValue, envVars));
          targetUrl = u.toString();
        } catch {}
      }
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, method: activeTab.method, headers, payload }),
      });
      const data = (await res.json()) as ApiResponse & { error?: string };
      if (data.error) {
        upd({ resError: data.error, loading: false });
        trackToolError(TOOL_SLUG, "send_rest", data.error);
      } else {
        upd({ response: data, loading: false });
        pushHistory({ method: activeTab.method, url: targetUrl, status: data.status, time: data.time });
        trackToolSuccess(TOOL_SLUG, "send_rest", { method: activeTab.method, status: data.status });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      upd({ resError: msg, loading: false });
      trackToolError(TOOL_SLUG, "send_rest", msg);
    }
  }, [activeTab, finalUrl, buildHeaders, buildBody, upd, pushHistory, envVars]);

  const sendGraphQL = useCallback(async () => {
    if (!finalUrl.trim()) return;
    upd({ loading: true, resError: "", response: null, resTab: "body" });
    try {
      let variables: Record<string, unknown> = {};
      try { variables = JSON.parse(activeTab.graphqlVariables.trim() || "{}") as Record<string, unknown>; }
      catch { upd({ resError: "Variables must be valid JSON.", loading: false }); return; }
      const headers = buildHeaders();
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
      const payloadObj: Record<string, unknown> = { query: activeTab.graphqlQuery, variables };
      if (activeTab.graphqlOpName.trim()) payloadObj.operationName = activeTab.graphqlOpName;
      const res = await fetch("/api/proxy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, method: "POST", headers, payload: JSON.stringify(payloadObj) }),
      });
      const data = (await res.json()) as ApiResponse & { error?: string };
      if (data.error) { upd({ resError: data.error, loading: false }); }
      else { upd({ response: data, loading: false }); pushHistory({ method: "POST", url: finalUrl, status: data.status, time: data.time }); }
    } catch (e) { upd({ resError: e instanceof Error ? e.message : "Request failed", loading: false }); }
  }, [finalUrl, activeTab, buildHeaders, upd, pushHistory]);

  const sendGrpc = useCallback(async () => {
    if (!finalUrl.trim()) return;
    upd({ loading: true, resError: "", response: null, resTab: "body" });
    try {
      JSON.parse(activeTab.grpcJsonBody);
      const headers = buildHeaders();
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
      const res = await fetch("/api/proxy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, method: "POST", headers, payload: activeTab.grpcJsonBody }),
      });
      const data = (await res.json()) as ApiResponse & { error?: string };
      if (data.error) { upd({ resError: data.error, loading: false }); }
      else { upd({ response: data, loading: false }); pushHistory({ method: "POST", url: finalUrl, status: data.status, time: data.time }); }
    } catch { upd({ resError: "Body must be valid JSON.", loading: false }); }
  }, [finalUrl, activeTab, buildHeaders, upd, pushHistory]);

  const handleSend = useCallback(() => {
    if (activeTab.transportMode === "graphql") { void sendGraphQL(); }
    else if (activeTab.transportMode === "grpc") { void sendGrpc(); }
    else { void sendRequest(); }
  }, [activeTab.transportMode, sendGraphQL, sendGrpc, sendRequest]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const pushWsLog = useCallback((kind: WsLogEntry["kind"], text: string) => {
    setWsLog(p => [...p, { id: uid(), t: Date.now(), kind, text }]);
  }, []);

  const connectWs = useCallback(() => {
    if (!wsTargetUrl) return;
    wsRef.current?.close();
    setWsLog([]); setWsStatus("connecting");
    pushWsLog("system", `Connecting to ${wsTargetUrl}…`);
    try {
      const protos = activeTab.wsSubprotocols.split(",").map(s => s.trim()).filter(Boolean);
      const ws = protos.length ? new WebSocket(wsTargetUrl, protos) : new WebSocket(wsTargetUrl);
      wsRef.current = ws;
      ws.onopen = () => { setWsStatus("open"); pushWsLog("system", "Connected."); };
      ws.onclose = (ev) => { setWsStatus("closed"); pushWsLog("system", `Closed (code ${ev.code}${ev.reason ? `: ${ev.reason}` : ""}).`); if (wsRef.current === ws) wsRef.current = null; };
      ws.onerror = () => { setWsStatus("error"); pushWsLog("system", "WebSocket error — check URL, TLS, and mixed-content policy."); };
      ws.onmessage = (ev) => {
        const text = typeof ev.data === "string" ? ev.data : ev.data instanceof ArrayBuffer ? `[binary ${ev.data.byteLength}B]` : `[blob ${(ev.data as Blob).size}B]`;
        pushWsLog("received", text);
      };
    } catch (e) { setWsStatus("error"); pushWsLog("system", e instanceof Error ? e.message : "Failed to connect."); }
  }, [wsTargetUrl, activeTab.wsSubprotocols, pushWsLog]);

  const disconnectWs = useCallback(() => { wsRef.current?.close(1000, "Closed by user"); }, []);
  const sendWsMsg = useCallback(() => {
    if (!wsOutgoing || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(wsOutgoing);
    pushWsLog("sent", wsOutgoing);
    setWsOutgoing("");
  }, [wsOutgoing, pushWsLog]);

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  const pushSioLog = useCallback((kind: WsLogEntry["kind"], text: string) => {
    setSioLog(p => [...p, { id: uid(), t: Date.now(), kind, text }]);
  }, []);

  const connectSio = useCallback(async () => {
    if (!finalUrl.trim()) return;
    sioRef.current?.disconnect();
    setSioLog([]); setSioStatus("connecting");
    pushSioLog("system", `Connecting (Socket.IO) to ${finalUrl}…`);
    let auth: Record<string, unknown> | undefined;
    try {
      const raw = activeTab.socketIoAuthJson.trim();
      if (raw && raw !== "{}") auth = JSON.parse(raw) as Record<string, unknown>;
    } catch { setSioStatus("error"); pushSioLog("system", "Auth JSON must be a valid object."); return; }
    try {
      const { io } = await import("socket.io-client");
      const path = activeTab.socketIoPath.startsWith("/") ? activeTab.socketIoPath : `/${activeTab.socketIoPath}`;
      const socket = io(finalUrl, { path, transports: activeTab.socketIoPollingOnly ? ["polling"] : ["polling", "websocket"], auth, autoConnect: true, reconnection: false });
      sioRef.current = socket;
      socket.on("connect", () => { setSioStatus("open"); pushSioLog("system", `Connected (id: ${socket.id}).`); });
      socket.on("disconnect", (reason) => { setSioStatus("closed"); pushSioLog("system", `Disconnected: ${reason}`); if (sioRef.current === socket) sioRef.current = null; });
      socket.on("connect_error", (err) => { setSioStatus("error"); pushSioLog("system", `connect_error: ${err instanceof Error ? err.message : String(err)}`); });
      socket.onAny((event, ...args) => { if (!["connect", "disconnect", "connect_error"].includes(event)) pushSioLog("received", `${event}: ${JSON.stringify(args)}`); });
    } catch (e) { setSioStatus("error"); pushSioLog("system", e instanceof Error ? e.message : "Socket.IO connect failed."); }
  }, [finalUrl, activeTab, pushSioLog]);

  const disconnectSio = useCallback(() => { sioRef.current?.disconnect(); }, []);
  const sendSioMsg = useCallback(() => {
    const sock = sioRef.current;
    if (!sock?.connected || !sioOutgoing.trim()) return;
    const ev = sioEvent.trim() || "message";
    let payload: unknown = sioOutgoing;
    try { payload = JSON.parse(sioOutgoing); } catch {}
    sock.emit(ev, payload);
    pushSioLog("sent", `${ev}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
    setSioOutgoing("");
  }, [sioEvent, sioOutgoing, pushSioLog]);

  useEffect(() => { return () => { wsRef.current?.close(); sioRef.current?.disconnect(); }; }, []);
  useEffect(() => { if (activeTab.transportMode !== "websocket") { wsRef.current?.close(); setWsStatus("idle"); } }, [activeTab.transportMode]);
  useEffect(() => { if (activeTab.transportMode !== "socketio") { sioRef.current?.disconnect(); setSioStatus("idle"); } }, [activeTab.transportMode]);
  useEffect(() => {
    const m = activeTab.transportMode;
    if (m === "graphql") upd({ reqTab: "graphqlOp" });
    else if (m === "grpc") upd({ reqTab: "grpcJson" });
    else if (m === "websocket" || m === "socketio") upd({ reqTab: "params" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab.transportMode]);

  // ── Import ────────────────────────────────────────────────────────────────
  const applyImport: ApiImportApply = useCallback((req: ImportedRequest) => {
    const headerPairs: KVPair[] = Object.entries(req.headers).map(([key, value]) => ({ key, value, enabled: true, id: uid() }));
    upd({
      transportMode: "http", method: req.method as HttpMethod, url: req.url,
      bodyContent: req.body ?? activeTab.bodyContent,
      bodyType: req.bodyType === "json" ? "json" : req.bodyType === "raw" ? "raw" : "none",
      customHeaders: headerPairs.length ? [...headerPairs, emptyKV()] : [emptyKV()],
      response: null, resError: "",
    });
    setShowImport(false);
  }, [activeTab.bodyContent, upd]);

  // ── Save to collection ────────────────────────────────────────────────────
  const saveToCollection = useCallback(() => {
    const collId = saveCollId || (collections[0]?.id ?? "");
    if (!collId) return;
    const req: SavedRequest = {
      id: uid(), name: saveReqName || `${activeTab.method} ${activeTab.url || "Untitled"}`,
      method: activeTab.method, url: activeTab.url, transportMode: activeTab.transportMode,
      tab: { method: activeTab.method, url: activeTab.url, params: activeTab.params, customHeaders: activeTab.customHeaders, bodyType: activeTab.bodyType, bodyContent: activeTab.bodyContent, authType: activeTab.authType, bearerToken: activeTab.bearerToken, basicUser: activeTab.basicUser, basicPass: activeTab.basicPass },
    };
    setCollections(prev => prev.map(c => c.id === collId ? { ...c, requests: [...c.requests, req] } : c));
    setShowSaveModal(false); setSaveReqName(""); setSaveCollId("");
  }, [saveCollId, saveReqName, activeTab, collections]);

  // ── Response formatted body ───────────────────────────────────────────────
  const formattedBody = useMemo(() => {
    if (!activeTab.response?.body) return "";
    const ct = activeTab.response.contentType;
    if (ct.includes("json")) return tryFmtJson(activeTab.response.body);
    if (ct.includes("xml") || ct.includes("html")) return tryFmtXml(activeTab.response.body);
    return activeTab.response.body;
  }, [activeTab.response]);

  const isJsonResponse = useMemo(() => activeTab.response?.contentType.includes("json") ?? false, [activeTab.response]);

  const codeSnippet = useMemo(() => {
    const headers = buildHeaders();
    const m = activeTab.transportMode;
    if (m === "graphql") {
      let vars: Record<string, unknown> = {};
      try { vars = JSON.parse(activeTab.graphqlVariables || "{}") as Record<string, unknown>; } catch {}
      const p = JSON.stringify({ query: activeTab.graphqlQuery, variables: vars, ...(activeTab.graphqlOpName ? { operationName: activeTab.graphqlOpName } : {}) });
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
      return genCode(activeTab.codeLang, "POST", finalUrl || "https://api.example.com/graphql", headers, p);
    }
    if (m === "grpc") {
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
      return genCode(activeTab.codeLang, "POST", finalUrl || "https://api.example.com/rpc", headers, activeTab.grpcJsonBody);
    }
    return genCode(activeTab.codeLang, activeTab.method, finalUrl || "https://api.example.com/", headers, buildBody());
  }, [activeTab, finalUrl, buildHeaders, buildBody]);

  const wsStatusLabel: Record<WsStatus, string> = { idle: "Disconnected", connecting: "Connecting…", open: "Connected", closed: "Closed", error: "Error" };

  // ── Request tabs per transport mode ───────────────────────────────────────
  const reqTabs = useMemo(() => {
    switch (activeTab.transportMode) {
      case "http": return [
        { id: "params" as ReqTab, label: "Params" }, { id: "body" as ReqTab, label: "Body" },
        { id: "auth" as ReqTab, label: "Auth" }, { id: "headers" as ReqTab, label: "Headers" },
      ];
      case "websocket": return [
        { id: "params" as ReqTab, label: "Params" }, { id: "subprotocols" as ReqTab, label: "Subprotocols" },
        { id: "headers" as ReqTab, label: "Headers" },
      ];
      case "socketio": return [
        { id: "params" as ReqTab, label: "Params" }, { id: "socketioOpts" as ReqTab, label: "Connection" },
        { id: "headers" as ReqTab, label: "Headers" },
      ];
      case "graphql": return [
        { id: "params" as ReqTab, label: "Params" }, { id: "graphqlOp" as ReqTab, label: "Operation" },
        { id: "graphqlVars" as ReqTab, label: "Variables" }, { id: "auth" as ReqTab, label: "Auth" },
        { id: "headers" as ReqTab, label: "Headers" },
      ];
      case "grpc": return [
        { id: "params" as ReqTab, label: "Params" }, { id: "grpcJson" as ReqTab, label: "JSON Body" },
        { id: "auth" as ReqTab, label: "Auth" }, { id: "headers" as ReqTab, label: "Headers" },
      ];
      default: return [];
    }
  }, [activeTab.transportMode]);

  const inputCls = "px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground/40";
  const tabBtnCls = (active: boolean) => `px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${active ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`;

  // ── Sidebar filtered history ──────────────────────────────────────────────
  const filteredHistory = useMemo(() => {
    if (!histSearch.trim()) return history.slice(0, 30);
    const q = histSearch.toLowerCase();
    return history.filter(h => h.url.toLowerCase().includes(q) || h.method.toLowerCase().includes(q)).slice(0, 30);
  }, [history, histSearch]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      {/* ── Workspace ────────────────────────────────────────────────── */}
      <div className="flex border-t border-border/60" style={{ height: "calc(100vh - 57px)", overflow: "hidden" }}>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 border-r border-border flex flex-col bg-muted/20 overflow-hidden">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <span className="text-xs font-semibold text-foreground">Explorer</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowEnvPanel(p => !p)}
                  title="Environment variables"
                  className={`p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${showEnvPanel ? "bg-muted text-foreground" : ""}`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <PanelLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Env panel */}
            {showEnvPanel && (
              <div className="border-b border-border p-3 space-y-2 bg-background/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Environment Variables</span>
                  <button onClick={() => setEnvVars(p => [...p, emptyKV()])} className="text-muted-foreground hover:text-accent transition-colors"><Plus className="w-3 h-3" /></button>
                </div>
                <div className="space-y-1">
                  {envVars.map(v => (
                    <div key={v.id} className="flex items-center gap-1 group">
                      <input type="checkbox" checked={v.enabled} onChange={e => setEnvVars(prev => prev.map(ev => ev.id === v.id ? { ...ev, enabled: e.target.checked } : ev))} className="rounded w-3 h-3 shrink-0 accent-accent" />
                      <input type="text" value={v.key} onChange={e => setEnvVars(prev => prev.map(ev => ev.id === v.id ? { ...ev, key: e.target.value } : ev))} placeholder="key" className="w-0 flex-1 px-1.5 py-1 text-[11px] rounded border border-border bg-background font-mono focus:outline-none" />
                      <input type="text" value={v.value} onChange={e => setEnvVars(prev => prev.map(ev => ev.id === v.id ? { ...ev, value: e.target.value } : ev))} placeholder="value" className="w-0 flex-1 px-1.5 py-1 text-[11px] rounded border border-border bg-background font-mono focus:outline-none" />
                      <button onClick={() => setEnvVars(p => p.filter(ev => ev.id !== v.id))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">Use <code className="font-mono">{"{{key}}"}</code> in URLs and headers.</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {/* Collections */}
              <div className="py-2">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Collections</span>
                  <button onClick={() => setShowNewColl(p => !p)} className="text-muted-foreground hover:text-accent transition-colors" title="New collection">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {showNewColl && (
                  <div className="px-3 pb-2 flex gap-1.5">
                    <input type="text" value={newCollName} onChange={e => setNewCollName(e.target.value)} placeholder="Collection name"
                      onKeyDown={e => { if (e.key === "Enter" && newCollName.trim()) { setCollections(p => [...p, { id: uid(), name: newCollName.trim(), requests: [], expanded: true }]); setNewCollName(""); setShowNewColl(false); } }}
                      className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background focus:outline-none" autoFocus />
                    <button onClick={() => { if (newCollName.trim()) { setCollections(p => [...p, { id: uid(), name: newCollName.trim(), requests: [], expanded: true }]); setNewCollName(""); setShowNewColl(false); } }} className="px-2 py-1 text-xs rounded bg-accent text-accent-foreground">Add</button>
                  </div>
                )}
                {collections.length === 0 && (
                  <p className="px-3 py-2 text-[11px] text-muted-foreground">No collections yet. Click + to create one.</p>
                )}
                {collections.map(coll => (
                  <div key={coll.id}>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted/60 transition-colors group cursor-pointer"
                      onClick={() => setCollections(p => p.map(c => c.id === coll.id ? { ...c, expanded: !c.expanded } : c))}>
                      <ChevronRight className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${coll.expanded ? "rotate-90" : ""}`} />
                      {coll.expanded ? <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span className="flex-1 text-xs truncate font-medium">{coll.name}</span>
                      <button onClick={e => { e.stopPropagation(); setCollections(p => p.filter(c => c.id !== coll.id)); }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-0.5 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {coll.expanded && coll.requests.map(req => (
                      <div key={req.id} className="flex items-center gap-1.5 pl-8 pr-2 py-1.5 hover:bg-muted/60 transition-colors group cursor-pointer"
                        onClick={() => addTab({ ...defaultTab(), ...req.tab, name: req.name, method: req.method, url: req.url, transportMode: req.transportMode })}>
                        <span className={`text-[10px] font-bold w-10 shrink-0 ${METHOD_COLORS[req.method]}`}>{req.method}</span>
                        <span className="flex-1 text-xs truncate text-muted-foreground">{req.name}</span>
                        <button onClick={e => { e.stopPropagation(); setCollections(p => p.map(c => c.id === coll.id ? { ...c, requests: c.requests.filter(r => r.id !== req.id) } : c)); }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-0.5 transition-all">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {coll.expanded && coll.requests.length === 0 && (
                      <p className="pl-8 pr-3 py-1 text-[11px] text-muted-foreground/60 italic">Empty collection</p>
                    )}
                  </div>
                ))}
              </div>

              {/* History */}
              <div className="py-2 border-t border-border/50">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3 h-3" /> History
                  </span>
                  {history.length > 0 && (
                    <button onClick={() => setHistory([])} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Clear</button>
                  )}
                </div>
                <div className="px-3 pb-1.5">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50" />
                    <input type="text" value={histSearch} onChange={e => setHistSearch(e.target.value)} placeholder="Filter history…"
                      className="w-full pl-6 pr-2 py-1 text-xs rounded border border-border bg-background focus:outline-none" />
                  </div>
                </div>
                {filteredHistory.length === 0 && (
                  <p className="px-3 py-2 text-[11px] text-muted-foreground">No history yet.</p>
                )}
                {filteredHistory.map(h => (
                  <button key={h.id} onClick={() => addTab({ ...defaultTab(), method: h.method, url: h.url })}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 transition-colors text-left group">
                    <span className={`text-[10px] font-bold w-10 shrink-0 ${METHOD_COLORS[h.method]}`}>{h.method}</span>
                    <span className="flex-1 text-[11px] font-mono text-muted-foreground truncate">{h.url}</span>
                    <span className={`text-[10px] font-medium shrink-0 ${statusColor(h.status)}`}>{h.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* ── Main area ────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-center border-b border-border bg-muted/20 shrink-0">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="px-2 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 border-r border-border">
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-none">
              {tabs.map(tab => (
                <div key={tab.id}
                  className={`flex items-center gap-2 px-3 py-2 border-r border-border cursor-pointer shrink-0 max-w-[180px] group transition-colors ${tab.id === activeTabId ? "bg-background border-b-2 border-b-accent -mb-px" : "hover:bg-muted/60 text-muted-foreground"}`}
                  onClick={() => setActiveTabId(tab.id)}>
                  <span className={`text-[10px] font-bold shrink-0 ${METHOD_COLORS[tab.method]}`}>{tab.method}</span>
                  <span className="text-xs truncate flex-1">{tab.name === "New Request" && tab.url ? tab.url.replace(/^https?:\/\//, "").slice(0, 20) : tab.name}</span>
                  {tabs.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-0.5 shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => addTab()} className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 border-l border-border" title="New request">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* URL bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-background shrink-0">
            {/* Transport mode pills */}
            <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5 bg-muted/30 shrink-0">
              {(["http", "graphql", "grpc", "websocket", "socketio"] as TransportMode[]).map(mode => (
                <button key={mode} onClick={() => upd({ transportMode: mode })}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${activeTab.transportMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {mode === "http" ? "HTTP" : mode === "graphql" ? "GQL" : mode === "grpc" ? "gRPC" : mode === "websocket" ? "WS" : "IO"}
                </button>
              ))}
            </div>

            {/* Method selector (HTTP/GQL/gRPC only) */}
            {(activeTab.transportMode === "http") && (
              <div className="relative shrink-0" ref={methodMenuRef}>
                <button onClick={() => setShowMethodMenu(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-bold ${METHOD_COLORS[activeTab.method]} hover:bg-muted transition-colors min-w-[105px] justify-between`}>
                  {activeTab.method} <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
                {showMethodMenu && (
                  <div className="absolute top-full left-0 mt-1 z-30 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[120px]">
                    {METHODS.map(m => (
                      <button key={m} onClick={() => { upd({ method: m }); setShowMethodMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-sm font-bold ${METHOD_COLORS[m]} hover:bg-muted transition-colors`}>
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* URL input */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={activeTab.url}
                onChange={e => upd({ url: e.target.value })}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (activeTab.transportMode === "websocket" && wsStatus !== "open" && wsStatus !== "connecting") connectWs();
                    else if (activeTab.transportMode === "socketio" && sioStatus !== "open" && sioStatus !== "connecting") void connectSio();
                    else if (activeTab.transportMode === "http" || activeTab.transportMode === "graphql" || activeTab.transportMode === "grpc") handleSend();
                  }
                }}
                placeholder={
                  activeTab.transportMode === "websocket" ? "wss://echo.websocket.events" :
                  activeTab.transportMode === "socketio" ? "https://your-server.com" :
                  activeTab.transportMode === "graphql" ? "https://api.example.com/graphql" :
                  activeTab.transportMode === "grpc" ? "https://gateway.example.com/package.Service/Method" :
                  "https://api.example.com/endpoint"
                }
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-muted/30 font-mono focus:outline-none focus:ring-2 focus:ring-ring/40 focus:bg-background placeholder:text-muted-foreground/40 transition-colors"
              />
              {hasEnvVars(activeTab.url) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-[10px] text-violet-400 font-medium">env</span>
                </div>
              )}
            </div>

            {/* Action button */}
            {activeTab.transportMode === "http" && (
              <>
                <button onClick={() => setShowImport(true)} title="Import"
                  className="flex items-center gap-1.5 px-2.5 py-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted shrink-0 transition-colors">
                  <FileUp className="w-4 h-4" />
                </button>
                <button onClick={() => { setShowSaveModal(true); setSaveReqName(`${activeTab.method} ${activeTab.url || "Untitled"}`); }}
                  title="Save" className="flex items-center gap-1.5 px-2.5 py-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted shrink-0 transition-colors">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={handleSend} disabled={activeTab.loading || !activeTab.url.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 shrink-0 ${METHOD_BG[activeTab.method]} hover:opacity-90 shadow-sm`}>
                  {activeTab.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </>
            )}
            {(activeTab.transportMode === "graphql" || activeTab.transportMode === "grpc") && (
              <button onClick={handleSend} disabled={activeTab.loading || !finalUrl.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 shrink-0 ${activeTab.transportMode === "graphql" ? "bg-violet-600 hover:bg-violet-700" : "bg-sky-600 hover:bg-sky-700"} shadow-sm`}>
                {activeTab.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            )}
            {activeTab.transportMode === "websocket" && (
              wsStatus === "open" ? (
                <button onClick={disconnectWs} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 shrink-0 transition-colors">
                  <Unplug className="w-4 h-4" /> Disconnect
                </button>
              ) : (
                <button onClick={connectWs} disabled={!wsTargetUrl || wsStatus === "connecting"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 shrink-0 transition-colors">
                  {wsStatus === "connecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                  Connect
                </button>
              )
            )}
            {activeTab.transportMode === "socketio" && (
              sioStatus === "open" ? (
                <button onClick={disconnectSio} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 shrink-0 transition-colors">
                  <Unplug className="w-4 h-4" /> Disconnect
                </button>
              ) : (
                <button onClick={() => void connectSio()} disabled={!finalUrl.trim() || sioStatus === "connecting"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 shrink-0 transition-colors">
                  {sioStatus === "connecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" />}
                  Connect
                </button>
              )
            )}
          </div>

          {/* Split workspace */}
          <div ref={workspaceRef} className="flex flex-col flex-1 min-h-0 overflow-hidden">

            {/* ── Request panel ─────────────────────────────────────────── */}
            <div style={{ height: `${splitPct}%` }} className="flex flex-col min-h-0 overflow-hidden border-b border-border bg-card">

              {/* Alert banners */}
              {activeTab.transportMode === "websocket" && (
                <div className="px-4 py-2 text-[11px] text-amber-800 dark:text-amber-200 bg-amber-500/8 border-b border-amber-500/20 shrink-0">
                  WebSocket connects <strong>directly from your browser</strong> — custom handshake headers aren&apos;t supported. Use Params for tokens, Subprotocols when needed.
                </div>
              )}
              {activeTab.transportMode === "socketio" && (
                <div className="px-4 py-2 text-[11px] text-amber-800 dark:text-amber-200 bg-amber-500/8 border-b border-amber-500/20 shrink-0">
                  Socket.IO connects directly from your browser (not via proxy). Configure path and auth on the <strong>Connection</strong> tab.
                </div>
              )}

              {/* Request tabs */}
              <div className="flex border-b border-border bg-muted/20 overflow-x-auto scrollbar-none shrink-0">
                {reqTabs.map(tab => (
                  <button key={tab.id} onClick={() => upd({ reqTab: tab.id })} className={tabBtnCls(activeTab.reqTab === tab.id)}>
                    {tab.label}
                    {/* Badge counts */}
                    {tab.id === "params" && activeTab.params.filter(p => p.enabled && p.key.trim()).length > 0 && (
                      <span className="ml-1.5 px-1 py-0.5 text-[10px] rounded bg-accent/20 text-accent">{activeTab.params.filter(p => p.enabled && p.key.trim()).length}</span>
                    )}
                    {tab.id === "headers" && activeTab.customHeaders.filter(p => p.enabled && p.key.trim()).length > 0 && (
                      <span className="ml-1.5 px-1 py-0.5 text-[10px] rounded bg-accent/20 text-accent">{activeTab.customHeaders.filter(p => p.enabled && p.key.trim()).length}</span>
                    )}
                    {tab.id === "auth" && activeTab.authType !== "none" && (
                      <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    )}
                    {tab.id === "body" && activeTab.bodyType !== "none" && (
                      <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    )}
                  </button>
                ))}
              </div>

              {/* Request tab content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4">

                {/* Params */}
                {activeTab.reqTab === "params" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">Query parameters appended to the URL.</p>
                    <KVTable pairs={activeTab.params} onChange={p => upd({ params: p })} keyPh="Parameter" valPh="Value" />
                    {finalUrl && activeTab.params.filter(p => p.enabled && p.key.trim()).length > 0 && (
                      <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                        <p className="text-[10px] text-muted-foreground mb-1">Preview URL</p>
                        <p className="text-xs font-mono text-foreground break-all">{finalUrl}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Body */}
                {activeTab.reqTab === "body" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {(["none", "json", "form", "xml", "raw"] as BodyType[]).map(bt => (
                        <button key={bt} onClick={() => upd({ bodyType: bt })}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab.bodyType === bt ? "bg-accent text-accent-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}>
                          {bt === "none" ? "None" : bt === "json" ? "JSON" : bt === "form" ? "Form Data" : bt === "xml" ? "XML" : "Raw Text"}
                        </button>
                      ))}
                    </div>
                    {activeTab.bodyType === "none" && (
                      <p className="text-xs text-muted-foreground py-2">No request body.</p>
                    )}
                    {activeTab.bodyType === "form" && (
                      <KVTable pairs={activeTab.formPairs} onChange={p => upd({ formPairs: p })} keyPh="Key" valPh="Value" />
                    )}
                    {activeTab.bodyType !== "none" && activeTab.bodyType !== "form" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {activeTab.bodyType === "json" ? "JSON" : activeTab.bodyType === "xml" ? "XML" : "Plain text"} body
                          </span>
                          {activeTab.bodyType === "json" && (
                            <button onClick={() => upd({ bodyContent: tryFmtJson(activeTab.bodyContent) })}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors">
                              <Wand2 className="w-3 h-3" /> Format
                            </button>
                          )}
                        </div>
                        <textarea
                          value={activeTab.bodyContent}
                          onChange={e => upd({ bodyContent: e.target.value })}
                          placeholder={activeTab.bodyType === "json" ? '{\n  "key": "value"\n}' : activeTab.bodyType === "xml" ? "<root>\n  <key>value</key>\n</root>" : "Raw text body..."}
                          rows={8}
                          spellCheck={false}
                          className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/30 scrollbar-thin"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Auth */}
                {activeTab.reqTab === "auth" && (
                  <div className="space-y-4">
                    {(activeTab.transportMode === "websocket" || activeTab.transportMode === "socketio") ? (
                      <div className="p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground">
                        {activeTab.transportMode === "websocket"
                          ? "Browser WebSocket handshakes can't carry Authorization headers. Use Params (query tokens) or Subprotocols instead."
                          : "Configure Socket.IO handshake auth as JSON on the Connection tab. For HTTP auth testing, switch to HTTP mode."}
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          {(["none", "bearer", "basic", "apikey", "custom"] as AuthType[]).map(at => (
                            <button key={at} onClick={() => upd({ authType: at })}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab.authType === at ? "bg-accent text-accent-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                              {at === "none" ? "None" : at === "bearer" ? "Bearer Token" : at === "basic" ? "Basic Auth" : at === "apikey" ? "API Key" : "Custom Header"}
                            </button>
                          ))}
                        </div>
                        {activeTab.authType === "bearer" && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Key className="w-3 h-3" /> Token</label>
                            <PasswordInput value={activeTab.bearerToken} onChange={v => upd({ bearerToken: v })} placeholder="Enter bearer token" className={`${inputCls} w-full`} />
                            <p className="text-[11px] text-muted-foreground">Sends as <code className="font-mono text-[10px]">Authorization: Bearer ...</code></p>
                          </div>
                        )}
                        {activeTab.authType === "basic" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Username</label>
                              <input type="text" value={activeTab.basicUser} onChange={e => upd({ basicUser: e.target.value })} placeholder="Username" className={`${inputCls} w-full`} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Password</label>
                              <PasswordInput value={activeTab.basicPass} onChange={v => upd({ basicPass: v })} placeholder="Password" className={`${inputCls} w-full`} />
                            </div>
                          </div>
                        )}
                        {activeTab.authType === "apikey" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Key name</label>
                                <input type="text" value={activeTab.apiKeyKey} onChange={e => upd({ apiKeyKey: e.target.value })} placeholder="X-API-Key" className={`${inputCls} w-full`} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Value</label>
                                <PasswordInput value={activeTab.apiKeyValue} onChange={v => upd({ apiKeyValue: v })} placeholder="api-key-value" className={`${inputCls} w-full`} />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-medium text-muted-foreground">Add to:</label>
                              {(["header", "query"] as const).map(opt => (
                                <label key={opt} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                  <input type="radio" checked={activeTab.apiKeyAddTo === opt} onChange={() => upd({ apiKeyAddTo: opt })} className="accent-accent" />
                                  {opt === "header" ? "Request Header" : "Query Params"}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        {activeTab.authType === "custom" && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Authorization header value</label>
                            <input type="text" value={activeTab.customAuth} onChange={e => upd({ customAuth: e.target.value })} placeholder="e.g. ApiKey abc123" className={`${inputCls} w-full`} />
                          </div>
                        )}
                        {activeTab.authType === "none" && (
                          <p className="text-xs text-muted-foreground py-2">No authorization header will be sent.</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Headers */}
                {activeTab.reqTab === "headers" && (
                  <div>
                    {(activeTab.transportMode === "websocket" || activeTab.transportMode === "socketio") ? (
                      <div className="p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground">
                        Custom HTTP headers are not supported on browser {activeTab.transportMode === "websocket" ? "WebSocket" : "Socket.IO"} handshakes. Use Params or the Connection/Subprotocols tab instead.
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mb-3">Custom request headers. Common headers like <code className="font-mono text-[11px]">Content-Type</code> and <code className="font-mono text-[11px]">Authorization</code> are set automatically by Body/Auth tabs.</p>
                        <KVTable pairs={activeTab.customHeaders} onChange={p => upd({ customHeaders: p })} keyPh="Header" valPh="Value" />
                      </>
                    )}
                  </div>
                )}

                {/* Subprotocols */}
                {activeTab.reqTab === "subprotocols" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Comma-separated <code className="font-mono text-[11px]">Sec-WebSocket-Protocol</code> values.</p>
                    <input type="text" value={activeTab.wsSubprotocols} onChange={e => upd({ wsSubprotocols: e.target.value })} placeholder="graphql-transport-ws, myprotocol" className={`${inputCls} w-full`} />
                  </div>
                )}

                {/* GraphQL Operation */}
                {activeTab.reqTab === "graphqlOp" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Operation name (optional)</label>
                      <input type="text" value={activeTab.graphqlOpName} onChange={e => upd({ graphqlOpName: e.target.value })} placeholder="e.g. GetUser" className={`${inputCls} w-full`} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">Query / Mutation</label>
                      </div>
                      <textarea value={activeTab.graphqlQuery} onChange={e => upd({ graphqlQuery: e.target.value })} rows={10} spellCheck={false}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 scrollbar-thin" />
                    </div>
                  </div>
                )}

                {/* GraphQL Variables */}
                {activeTab.reqTab === "graphqlVars" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">JSON object passed as the <code className="font-mono text-[11px]">variables</code> field.</p>
                    <textarea value={activeTab.graphqlVariables} onChange={e => upd({ graphqlVariables: e.target.value })} rows={10} spellCheck={false} placeholder="{}"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 scrollbar-thin" />
                  </div>
                )}

                {/* gRPC JSON body */}
                {activeTab.reqTab === "grpcJson" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Unary JSON payload for gRPC-Gateway / JSON transcoding endpoints.</p>
                    <textarea value={activeTab.grpcJsonBody} onChange={e => upd({ grpcJsonBody: e.target.value })} rows={10} spellCheck={false} placeholder='{"field":"value"}'
                      className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 scrollbar-thin" />
                  </div>
                )}

                {/* Socket.IO connection opts */}
                {activeTab.reqTab === "socketioOpts" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Socket.IO path</label>
                      <input type="text" value={activeTab.socketIoPath} onChange={e => upd({ socketIoPath: e.target.value })} placeholder="/socket.io" className={`${inputCls} w-full`} />
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" checked={activeTab.socketIoPollingOnly} onChange={e => upd({ socketIoPollingOnly: e.target.checked })} className="rounded accent-accent" />
                      <span className="text-muted-foreground text-xs">Long-polling only (skip WebSocket upgrade)</span>
                    </label>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Handshake auth (JSON)</label>
                      <textarea value={activeTab.socketIoAuthJson} onChange={e => upd({ socketIoAuthJson: e.target.value })} rows={4} spellCheck={false} placeholder='{"token":"..."}'
                        className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 scrollbar-thin" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Drag handle ───────────────────────────────────────────── */}
            <div onMouseDown={onDragStart}
              className="h-1.5 bg-border/60 hover:bg-accent/40 cursor-row-resize transition-colors flex items-center justify-center shrink-0 group select-none">
              <div className="w-8 h-0.5 rounded-full bg-muted-foreground/30 group-hover:bg-accent/60 transition-colors" />
            </div>

            {/* ── Response / WS panel ───────────────────────────────────── */}
            <div style={{ height: `${100 - splitPct - 0.5}%` }} className="flex flex-col min-h-0 overflow-hidden bg-card">

              {(activeTab.transportMode === "http" || activeTab.transportMode === "graphql" || activeTab.transportMode === "grpc") ? (
                <>
                  {/* Response status bar */}
                  {activeTab.response && (
                    <div className={`flex flex-wrap items-center gap-4 px-4 py-2 border-b text-sm shrink-0 ${statusBg(activeTab.response.status)}`}>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${activeTab.response.status < 300 ? "bg-emerald-500" : activeTab.response.status < 400 ? "bg-amber-500" : "bg-red-500"}`} />
                        <span className={`font-bold font-mono text-sm ${statusColor(activeTab.response.status)}`}>
                          {activeTab.response.status} {activeTab.response.statusText}
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> {activeTab.response.time} ms
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" /> {formatBytes(activeTab.response.size)}
                      </span>
                      {activeTab.response.redirected && (
                        <span className="text-xs text-amber-500">Redirected → {activeTab.response.finalUrl}</span>
                      )}
                    </div>
                  )}

                  {/* Response tabs */}
                  <div className="flex border-b border-border bg-muted/20 overflow-x-auto scrollbar-none shrink-0">
                    {(["body", "headers", "raw", "timing", "code"] as ResTab[]).map(tab => (
                      <button key={tab} onClick={() => upd({ resTab: tab })} className={tabBtnCls(activeTab.resTab === tab)}>
                        {tab === "body" ? "Body" : tab === "headers" ? "Headers" : tab === "raw" ? "Raw" : tab === "timing" ? "Timing" : "Code"}
                        {tab === "headers" && activeTab.response && (
                          <span className="ml-1.5 px-1 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">{Object.keys(activeTab.response.headers).length}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Response content */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
                    {activeTab.loading && (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
                        <p className="text-sm">Sending request…</p>
                      </div>
                    )}

                    {activeTab.resError && !activeTab.loading && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-destructive">Request failed</p>
                          <p className="text-xs text-muted-foreground mt-1">{activeTab.resError}</p>
                        </div>
                      </div>
                    )}

                    {!activeTab.response && !activeTab.loading && !activeTab.resError && (
                      <>
                        {activeTab.resTab === "code" ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-muted-foreground">Language:</label>
                              <select value={activeTab.codeLang} onChange={e => upd({ codeLang: e.target.value })}
                                className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none">
                                <option value="curl">cURL / Bash</option>
                                <option value="javascript">JavaScript (fetch)</option>
                                <option value="python">Python (requests)</option>
                                <option value="node">Node.js (https)</option>
                                <option value="php">PHP (cURL)</option>
                                <option value="java">Java (HttpClient)</option>
                                <option value="csharp">C# (.NET)</option>
                              </select>
                              <CopyBtn text={codeSnippet} />
                            </div>
                            <pre className="p-4 rounded-xl bg-[#0d1117] border border-border font-mono text-xs overflow-auto max-h-96 scrollbar-thin whitespace-pre-wrap text-slate-200">
                              {codeSnippet}
                            </pre>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Send className="w-10 h-10 mb-4 opacity-15" />
                            <p className="text-sm font-medium">Send a request to see the response</p>
                            <p className="text-xs mt-1 opacity-60">
                              {activeTab.transportMode === "graphql" ? "POST with application/json body { query, variables } via proxy." :
                               activeTab.transportMode === "grpc" ? "POST with JSON body to gRPC-Gateway or JSON transcoding endpoint." :
                               "Supports GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS"}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab.response && !activeTab.loading && (
                      <>
                        {/* Body */}
                        {activeTab.resTab === "body" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{activeTab.response.contentType || "unknown content-type"}</span>
                              <CopyBtn text={formattedBody} />
                            </div>
                            {isJsonResponse ? (
                              <pre
                                className="p-4 rounded-xl bg-[#0d1117] border border-border font-mono text-xs overflow-auto max-h-full scrollbar-thin whitespace-pre-wrap leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: highlightJson(formattedBody) }}
                              />
                            ) : (
                              <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs overflow-auto max-h-full scrollbar-thin whitespace-pre-wrap">
                                {formattedBody || "(empty body)"}
                              </pre>
                            )}
                          </div>
                        )}

                        {/* Headers */}
                        {activeTab.resTab === "headers" && (
                          <div className="space-y-0.5">
                            {Object.entries(activeTab.response.headers).map(([k, v]) => (
                              <div key={k} className="flex gap-3 py-2 border-b border-border/40 group">
                                <span className="font-mono text-xs font-semibold text-violet-400 shrink-0 w-48 truncate">{k}</span>
                                <span className="font-mono text-xs text-muted-foreground break-all flex-1">{v}</span>
                                <CopyBtn text={v} size="xs" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Raw */}
                        {activeTab.resTab === "raw" && (
                          <div className="space-y-2">
                            <div className="flex justify-end"><CopyBtn text={activeTab.response.body} /></div>
                            <pre className="p-4 rounded-xl bg-[#0d1117] border border-border font-mono text-xs overflow-auto scrollbar-thin whitespace-pre-wrap text-slate-300">
                              {activeTab.response.body || "(empty body)"}
                            </pre>
                          </div>
                        )}

                        {/* Timing */}
                        {activeTab.resTab === "timing" && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <TimingStat label="Total Time" value={`${activeTab.response.time} ms`} accent />
                              <TimingStat label="Status Code" value={String(activeTab.response.status)} />
                              <TimingStat label="Response Size" value={formatBytes(activeTab.response.size)} />
                              <TimingStat label="Redirected" value={activeTab.response.redirected ? "Yes" : "No"} />
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 border border-border">
                              <p className="text-xs font-semibold mb-3 text-muted-foreground">Timeline</p>
                              <div className="h-5 rounded-full overflow-hidden bg-muted/80">
                                <div className={`${METHOD_BG[activeTab.method]} h-full rounded-full transition-all`} style={{ width: "100%" }} />
                              </div>
                              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                                <span>0 ms</span>
                                <span>{activeTab.response.time} ms</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Code snippets */}
                        {activeTab.resTab === "code" && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-muted-foreground">Language:</label>
                              <select value={activeTab.codeLang} onChange={e => upd({ codeLang: e.target.value })}
                                className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none">
                                <option value="curl">cURL / Bash</option>
                                <option value="javascript">JavaScript (fetch)</option>
                                <option value="python">Python (requests)</option>
                                <option value="node">Node.js (https)</option>
                                <option value="php">PHP (cURL)</option>
                                <option value="java">Java (HttpClient)</option>
                                <option value="csharp">C# (.NET)</option>
                              </select>
                              <CopyBtn text={codeSnippet} />
                            </div>
                            <pre className="p-4 rounded-xl bg-[#0d1117] border border-border font-mono text-xs overflow-auto scrollbar-thin whitespace-pre-wrap text-slate-200">
                              {codeSnippet}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : activeTab.transportMode === "websocket" ? (
                // ── WebSocket panel ──────────────────────────────────────
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">WebSocket Messages</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wsStatus === "open" ? "bg-emerald-500/15 text-emerald-500" : wsStatus === "connecting" ? "bg-amber-500/15 text-amber-500" : wsStatus === "error" ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"}`}>
                        {wsStatusLabel[wsStatus]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyBtn text={wsLog.map(l => `[${l.kind}] ${new Date(l.t).toISOString()}\n${l.text}`).join("\n\n")} label="Copy log" />
                      <button onClick={() => setWsLog([])} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin min-h-0">
                    {wsLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Radio className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">Connect to see frames here.</p>
                        <p className="text-xs mt-1 opacity-60">Example: <code className="font-mono text-[11px]">wss://echo.websocket.events</code></p>
                      </div>
                    ) : wsLog.map(entry => (
                      <div key={entry.id} className={`rounded-lg border p-2.5 font-mono text-xs ${entry.kind === "sent" ? "border-emerald-500/20 bg-emerald-500/5" : entry.kind === "received" ? "border-blue-500/20 bg-blue-500/5" : "border-border bg-muted/30"}`}>
                        <div className="flex items-center justify-between mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                          <span>{entry.kind === "sent" ? "↑ Sent" : entry.kind === "received" ? "↓ Received" : "● System"}</span>
                          <span>{new Date(entry.t).toLocaleTimeString()}</span>
                        </div>
                        <pre className="whitespace-pre-wrap break-all">{entry.text}</pre>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border p-3 bg-muted/10 shrink-0">
                    <div className="flex gap-2">
                      <textarea value={wsOutgoing} onChange={e => setWsOutgoing(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendWsMsg(); } }}
                        placeholder="Message · Enter to send · Shift+Enter for newline" rows={2} disabled={wsStatus !== "open"} spellCheck={false}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring/40 disabled:opacity-50" />
                      <button onClick={sendWsMsg} disabled={wsStatus !== "open" || !wsOutgoing.trim()}
                        className="self-end px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // ── Socket.IO panel ──────────────────────────────────────
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center gap-2">
                      <PlugZap className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">Socket.IO Events</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sioStatus === "open" ? "bg-emerald-500/15 text-emerald-500" : sioStatus === "connecting" ? "bg-amber-500/15 text-amber-500" : sioStatus === "error" ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"}`}>
                        {wsStatusLabel[sioStatus]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyBtn text={sioLog.map(l => `[${l.kind}] ${new Date(l.t).toISOString()}\n${l.text}`).join("\n\n")} label="Copy log" />
                      <button onClick={() => setSioLog([])} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin min-h-0">
                    {sioLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <PlugZap className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">Connect to a Socket.IO server to see events.</p>
                      </div>
                    ) : sioLog.map(entry => (
                      <div key={entry.id} className={`rounded-lg border p-2.5 font-mono text-xs ${entry.kind === "sent" ? "border-emerald-500/20 bg-emerald-500/5" : entry.kind === "received" ? "border-blue-500/20 bg-blue-500/5" : "border-border bg-muted/30"}`}>
                        <div className="flex items-center justify-between mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                          <span>{entry.kind === "sent" ? "↑ Emitted" : entry.kind === "received" ? "↓ Received" : "● System"}</span>
                          <span>{new Date(entry.t).toLocaleTimeString()}</span>
                        </div>
                        <pre className="whitespace-pre-wrap break-all">{entry.text}</pre>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border p-3 bg-muted/10 shrink-0 space-y-2">
                    <div className="flex gap-2 items-center">
                      <label className="text-xs text-muted-foreground shrink-0">Event:</label>
                      <input type="text" value={sioEvent} onChange={e => setSioEvent(e.target.value)} placeholder="message" disabled={sioStatus !== "open"}
                        className="w-36 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background font-mono focus:outline-none disabled:opacity-50" />
                    </div>
                    <div className="flex gap-2">
                      <textarea value={sioOutgoing} onChange={e => setSioOutgoing(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendSioMsg(); } }}
                        placeholder="Payload (JSON or plain text) · Enter to emit" rows={2} disabled={sioStatus !== "open"} spellCheck={false}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring/40 disabled:opacity-50" />
                      <button onClick={sendSioMsg} disabled={sioStatus !== "open" || !sioOutgoing.trim()}
                        className="self-end px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center gap-2">
                        <Send className="w-4 h-4" /> Emit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Import panel */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl">
            <ApiImportPanel onApply={applyImport} onClose={() => setShowImport(false)} />
          </div>
        </div>
      )}

      {/* Save to collection modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Save Request</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Request name</label>
                <input type="text" value={saveReqName} onChange={e => setSaveReqName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Collection</label>
                {collections.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">No collections yet. Enter a name to create one:</p>
                    <input type="text" value={newCollName} onChange={e => setNewCollName(e.target.value)} placeholder="Collection name"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none" />
                    <button onClick={() => { if (newCollName.trim()) { const id = uid(); setCollections(p => [...p, { id, name: newCollName.trim(), requests: [], expanded: true }]); setSaveCollId(id); setNewCollName(""); } }} className="text-xs text-accent hover:underline">+ Create collection</button>
                  </div>
                ) : (
                  <select value={saveCollId || collections[0]?.id} onChange={e => setSaveCollId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none">
                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={saveToCollection} disabled={!saveReqName.trim() || (collections.length === 0)}
                className="flex-1 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Below-fold SEO content ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-10 w-full pt-8 mt-2 space-y-3 border-t border-border">
        <h2 className="text-base font-semibold text-foreground">Browser-based HTTP client — test APIs without installing tools</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The DevBench <strong>API Tester</strong> lets you send HTTP requests (GET, POST, PUT, PATCH, DELETE) directly from your browser without installing Postman, Insomnia, or any other client.
          Add headers, set a request body, configure authentication, and inspect formatted JSON or text responses — all in one workspace.
          Requests go through our secure server-side proxy, bypassing CORS restrictions so any public API works out of the box.
        </p>
        <h2 className="text-base font-semibold text-foreground mt-6">Features</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS methods</li>
          <li>Collections to save and organise requests (stored locally)</li>
          <li>Environment variables with <code className="font-mono text-xs">{"{{variable}}"}</code> substitution</li>
          <li>Multiple request tabs — open several requests at once</li>
          <li>Bearer, Basic, API Key, and custom Authorization headers</li>
          <li>JSON (with syntax highlighting), Form Data, XML, and raw request bodies</li>
          <li>Response headers, timing, raw body, and code snippet export</li>
          <li>WebSocket and Socket.IO connection testing</li>
          <li>GraphQL over HTTP and gRPC-Gateway / JSON transcoding</li>
          <li>Import from HAR, cURL, OpenAPI, and Postman collections</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Also useful:{" "}
          <Link href="/tools/curl-to-fetch" className="text-accent hover:underline">cURL → Fetch converter</Link>{", "}
          <Link href="/tools/url-parser" className="text-accent hover:underline">URL Parser</Link>{", "}
          <a href="/json" className="text-accent hover:underline">JSON Formatter</a>.
        </p>
      </section>
    </>
  );
}
