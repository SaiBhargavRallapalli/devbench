// Copyright (c) 2026 DevBench contributors. MIT License.

export type NotepadEol = "LF" | "CRLF";
export type NotepadEncoding = "utf-8" | "utf-8-bom" | "utf-16le-bom";
export type NotepadSplitMode = "none" | "vertical" | "horizontal";
export type NotepadSidePanel = "docs" | "outline" | "chars" | "recent" | "bookmarks";

export type NotepadDocument = {
  id: string;
  name: string;
  content: string;
  language: string;
  eol: NotepadEol;
  encoding: NotepadEncoding;
  dirty: boolean;
  readOnly: boolean;
  bookmarks: number[];
};

export type NotepadSession = {
  v: 2;
  activeId: string;
  secondaryDocId: string | null;
  splitMode: NotepadSplitMode;
  docs: NotepadDocument[];
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  renderWhitespace: "none" | "selection" | "all";
  fontSize: number;
  tabSize: number;
  insertSpaces: boolean;
  showToolbar: boolean;
  showStatusBar: boolean;
  showSidePanel: boolean;
  sidePanel: NotepadSidePanel;
  fullScreen: boolean;
};

const STORAGE_KEY = "devbench:notepad-session";
const MAX_DOCS = 32;

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDocument(partial?: Partial<NotepadDocument>): NotepadDocument {
  return {
    id: partial?.id ?? uid(),
    name: partial?.name ?? "new 1",
    content: partial?.content ?? "",
    language: partial?.language ?? "plaintext",
    eol: partial?.eol ?? "LF",
    encoding: partial?.encoding ?? "utf-8",
    dirty: partial?.dirty ?? false,
    readOnly: partial?.readOnly ?? false,
    bookmarks: partial?.bookmarks ?? [],
  };
}

export function nextUntitledName(docs: NotepadDocument[]): string {
  let n = 1;
  const names = new Set(docs.map((d) => d.name.toLowerCase()));
  while (names.has(`new ${n}`.toLowerCase())) n++;
  return `new ${n}`;
}

function migrateSession(raw: unknown): NotepadSession | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.docs) || o.docs.length === 0) return null;

  const docs = (o.docs as Record<string, unknown>[]).map((d) =>
    createDocument({
      id: String(d.id),
      name: String(d.name ?? "untitled"),
      content: String(d.content ?? ""),
      language: String(d.language ?? "plaintext"),
      eol: d.eol === "CRLF" ? "CRLF" : "LF",
      encoding:
        d.encoding === "utf-8-bom" || d.encoding === "utf-16le-bom"
          ? (d.encoding as NotepadEncoding)
          : "utf-8",
      dirty: Boolean(d.dirty),
      readOnly: Boolean(d.readOnly),
      bookmarks: Array.isArray(d.bookmarks)
        ? (d.bookmarks as number[]).filter((n) => Number.isFinite(n))
        : [],
    }),
  );

  const activeId = String(o.activeId ?? docs[0].id);
  return {
    v: 2,
    activeId: docs.some((d) => d.id === activeId) ? activeId : docs[0].id,
    secondaryDocId:
      o.secondaryDocId && docs.some((d) => d.id === o.secondaryDocId)
        ? String(o.secondaryDocId)
        : null,
    splitMode:
      o.splitMode === "vertical" || o.splitMode === "horizontal" ? o.splitMode : "none",
    docs,
    wordWrap: Boolean(o.wordWrap),
    minimap: o.minimap !== false,
    lineNumbers: o.lineNumbers !== false,
    renderWhitespace:
      o.renderWhitespace === "all" || o.renderWhitespace === "none"
        ? o.renderWhitespace
        : "selection",
    fontSize: typeof o.fontSize === "number" ? o.fontSize : 14,
    tabSize: typeof o.tabSize === "number" ? o.tabSize : 4,
    insertSpaces: o.insertSpaces !== false,
    showToolbar: o.showToolbar !== false,
    showStatusBar: o.showStatusBar !== false,
    showSidePanel: Boolean(o.showSidePanel),
    sidePanel:
      o.sidePanel === "outline" ||
      o.sidePanel === "chars" ||
      o.sidePanel === "recent" ||
      o.sidePanel === "bookmarks"
        ? o.sidePanel
        : "docs",
    fullScreen: Boolean(o.fullScreen),
  };
}

export function defaultSession(): NotepadSession {
  const doc = createDocument({ name: "new 1" });
  return {
    v: 2,
    activeId: doc.id,
    secondaryDocId: null,
    splitMode: "none",
    docs: [doc],
    wordWrap: false,
    minimap: true,
    lineNumbers: true,
    renderWhitespace: "selection",
    fontSize: 14,
    tabSize: 4,
    insertSpaces: true,
    showToolbar: true,
    showStatusBar: true,
    showSidePanel: false,
    sidePanel: "docs",
    fullScreen: false,
  };
}

export function loadNotepadSession(): NotepadSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrateSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveNotepadSession(session: NotepadSession): void {
  try {
    const trimmed: NotepadSession = {
      ...session,
      docs: session.docs.slice(0, MAX_DOCS),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
}

export function applyEol(content: string, eol: NotepadEol): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return eol === "CRLF" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

export function countLines(text: string): number {
  if (!text) return 1;
  return text.split("\n").length;
}

export const NOTEPAD_TOOL_SLUG = "notepad-plus-plus";
