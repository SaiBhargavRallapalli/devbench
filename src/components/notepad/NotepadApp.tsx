"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  PanelLeft,
  Save,
  Share2,
  X,
} from "lucide-react";
import type { editor as MonacoEditor } from "monaco-editor";
import ToolPageHero from "@/components/tools/ToolPageHero";
import VaultSaveButton from "@/components/VaultSaveButton";
import { NotepadMenuBar, type MenuItem } from "@/components/notepad/NotepadMenuBar";
import { useNotepadController } from "@/components/notepad/useNotepadController";
import { NOTEPAD_LANGUAGES } from "@/lib/notepad-languages";
import {
  countLines,
  NOTEPAD_TOOL_SLUG,
  type NotepadDocument,
  type NotepadEncoding,
} from "@/lib/notepad-session";
import { getSelectionText, replaceSelection } from "@/lib/notepad/editor-actions";
import { clearMacro } from "@/lib/notepad/macros";
import type { Tool } from "@/lib/tools-registry";
import { PLAYGROUND_MONACO_VS_CDN } from "@/lib/playground/constants";

const Monaco = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  },
);

let monacoConfigured = false;

function ensureMonaco(): void {
  if (monacoConfigured || typeof window === "undefined") return;
  monacoConfigured = true;
  void import("@monaco-editor/react").then(({ loader }) => {
    loader.config({ paths: { vs: PLAYGROUND_MONACO_VS_CDN } });
  });
}

function useIsDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains("dark"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function parseOutline(content: string): { line: number; text: string }[] {
  const lines = content.split("\n");
  const out: { line: number; text: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const md = line.match(/^(#{1,6})\s+(.+)/);
    if (md) {
      out.push({ line: i + 1, text: `${"#".repeat(md[1].length)} ${md[2]}` });
      continue;
    }
    const fn = line.match(
      /^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)|^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/,
    );
    if (fn) out.push({ line: i + 1, text: fn[1] ?? fn[2] ?? line.trim() });
  }
  return out.slice(0, 200);
}

const CHAR_MAP =
  "©®™€£¥§¶†‡•…–—‘’“”«»±×÷≠≤≥≈∞√∑∏∫∂∆µπΩαβγδθλσφψω←→↑↓↔⇒⇐⇔∀∃∈∉⊂⊃∪∩∧∨¬";

export type NotepadAppProps = {
  mode?: "workspace" | "compact";
  tool?: Tool;
};

export default function NotepadApp({ mode = "workspace", tool }: NotepadAppProps) {
  const c = useNotepadController();
  const dark = useIsDark();
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    ensureMonaco();
  }, []);

  const transformSelection = useCallback(
    (mode: "upper" | "lower" | "title") => {
      const ed = c.activeEditor();
      const sel = getSelectionText(ed);
      if (!sel) return;
      let next = sel;
      if (mode === "upper") next = sel.toUpperCase();
      else if (mode === "lower") next = sel.toLowerCase();
      else next = sel.replace(/\b\w/g, (ch) => ch.toUpperCase());
      replaceSelection(ed, next);
    },
    [c],
  );

  const menuItems = useMemo(() => {
    const file: MenuItem[] = [
      { type: "item", label: "New", shortcut: "Ctrl+N", onClick: c.newDoc },
      { type: "item", label: "Open…", shortcut: "Ctrl+O", onClick: () => c.fileInputRef.current?.click() },
      { type: "separator" },
      {
        type: "item",
        label: "Save / Download",
        shortcut: "Ctrl+S",
        onClick: () => c.activeDoc && c.saveDoc(c.activeDoc),
      },
      {
        type: "item",
        label: "Save As…",
        shortcut: "Ctrl+Shift+S",
        onClick: () => c.activeDoc && c.saveDoc(c.activeDoc, true),
      },
      { type: "item", label: "Save All", onClick: c.saveAll },
      { type: "item", label: "Rename…", onClick: () => {
          if (c.activeDoc) {
            c.setRenameValue(c.activeDoc.name);
            c.setRenameOpen(true);
          }
        }},
      { type: "separator" },
      {
        type: "item",
        label: "Close",
        shortcut: "Ctrl+W",
        onClick: () => c.activeDoc && c.closeDoc(c.activeDoc.id),
      },
      { type: "item", label: "Close Others", onClick: c.closeOthers },
      { type: "item", label: "Close All", onClick: c.closeAll },
      { type: "separator" },
      { type: "item", label: "Print", onClick: c.printActive },
      { type: "separator" },
      {
        type: "submenu",
        label: "Recent files",
        items: c.recentFiles.length
          ? c.recentFiles.map((f) => ({
              type: "item" as const,
              label: f.name,
              onClick: () => c.openRecent(f.name),
            }))
          : [{ type: "item" as const, label: "(empty)", disabled: true, onClick: () => {} }],
      },
      { type: "item", label: "Clear recent list", onClick: c.clearRecentFiles },
    ];

    const edit: MenuItem[] = [
      { type: "item", label: "Undo", shortcut: "Ctrl+Z", onClick: c.undo },
      { type: "item", label: "Redo", shortcut: "Ctrl+Y", onClick: c.redo },
      { type: "separator" },
      { type: "item", label: "Cut", shortcut: "Ctrl+X", onClick: () => document.execCommand("cut") },
      { type: "item", label: "Copy", shortcut: "Ctrl+C", onClick: () => document.execCommand("copy") },
      { type: "item", label: "Paste", shortcut: "Ctrl+V", onClick: () => document.execCommand("paste") },
      { type: "item", label: "Select All", shortcut: "Ctrl+A", onClick: c.selectAll },
      { type: "separator" },
      { type: "item", label: "Duplicate line", onClick: c.duplicateLine },
      { type: "item", label: "Delete line", onClick: c.deleteLine },
      { type: "item", label: "Move line up", onClick: c.moveLineUp },
      { type: "item", label: "Move line down", onClick: c.moveLineDown },
      { type: "item", label: "Join lines", onClick: c.joinLines },
      { type: "item", label: "Transpose chars", onClick: c.transposeChars },
      { type: "separator" },
      { type: "item", label: "Toggle comment", onClick: c.toggleComment },
      { type: "item", label: "Increase indent", onClick: c.indent },
      { type: "item", label: "Decrease indent", onClick: c.unindent },
      { type: "separator" },
      { type: "item", label: "Trim trailing space", onClick: c.trimTrailing },
      { type: "item", label: "Trim leading space", onClick: c.trimLeading },
      { type: "item", label: "Remove empty lines", onClick: c.removeEmpty },
      { type: "item", label: "Sort lines", onClick: () => c.sortLines() },
      { type: "item", label: "Reverse lines", onClick: c.reverseLines },
      { type: "separator" },
      { type: "item", label: "UPPERCASE", onClick: () => transformSelection("upper") },
      { type: "item", label: "lowercase", onClick: () => transformSelection("lower") },
      { type: "item", label: "Title Case", onClick: () => transformSelection("title") },
    ];

    const search: MenuItem[] = [
      { type: "item", label: "Find…", shortcut: "Ctrl+F", onClick: c.focusFind },
      { type: "item", label: "Replace…", shortcut: "Ctrl+H", onClick: c.focusReplace },
      { type: "item", label: "Go to line…", shortcut: "Ctrl+G", onClick: () => c.setGoToOpen(true) },
      { type: "separator" },
      { type: "item", label: "Toggle bookmark", onClick: c.toggleBookmarkAtCursor },
      { type: "item", label: "Next bookmark", onClick: () => c.gotoBookmark("next") },
      { type: "item", label: "Previous bookmark", onClick: () => c.gotoBookmark("prev") },
    ];

    const view: MenuItem[] = [
      {
        type: "item",
        label: c.session.wordWrap ? "Word wrap ✓" : "Word wrap",
        onClick: () => c.patchSession({ wordWrap: !c.session.wordWrap }),
      },
      {
        type: "item",
        label: c.session.minimap ? "Minimap ✓" : "Minimap",
        onClick: () => c.patchSession({ minimap: !c.session.minimap }),
      },
      {
        type: "item",
        label: c.session.lineNumbers ? "Line numbers ✓" : "Line numbers",
        onClick: () => c.patchSession({ lineNumbers: !c.session.lineNumbers }),
      },
      {
        type: "submenu",
        label: "Show whitespace",
        items: (["none", "selection", "all"] as const).map((w) => ({
          type: "item" as const,
          label: w === c.session.renderWhitespace ? `${w} ✓` : w,
          onClick: () => c.patchSession({ renderWhitespace: w }),
        })),
      },
      { type: "separator" },
      { type: "item", label: "Split vertical", onClick: () => c.toggleSplit("vertical") },
      { type: "item", label: "Split horizontal", onClick: () => c.toggleSplit("horizontal") },
      { type: "item", label: "Close split", onClick: () => c.toggleSplit("none") },
      { type: "item", label: "Clone to other view", onClick: c.cloneToOtherView },
      { type: "separator" },
      {
        type: "item",
        label: c.session.showSidePanel ? "Hide side panel" : "Show side panel",
        onClick: () => c.patchSession({ showSidePanel: !c.session.showSidePanel }),
      },
      { type: "item", label: "Full screen", shortcut: "F11", onClick: () => c.patchSession({ fullScreen: !c.session.fullScreen }) },
      { type: "separator" },
      { type: "item", label: "Zoom in", onClick: () => c.patchSession({ fontSize: Math.min(28, c.session.fontSize + 1) }) },
      { type: "item", label: "Zoom out", onClick: () => c.patchSession({ fontSize: Math.max(10, c.session.fontSize - 1) }) },
      { type: "item", label: "Fold all", onClick: c.foldAll },
      { type: "item", label: "Unfold all", onClick: c.unfoldAll },
    ];

    const encoding: MenuItem[] = (["utf-8", "utf-8-bom", "utf-16le-bom"] as NotepadEncoding[]).map(
      (enc) => ({
        type: "item" as const,
        label:
          c.activeDoc?.encoding === enc
            ? `${c.encodingLabel(enc)} ✓`
            : c.encodingLabel(enc),
        onClick: () =>
          c.activeDoc && c.updateDoc(c.activeDoc.id, { encoding: enc, dirty: true }),
      }),
    );

    const language: MenuItem[] = NOTEPAD_LANGUAGES.map((l) => ({
      type: "item" as const,
      label: c.activeDoc?.language === l.id ? `${l.label} ✓` : l.label,
      onClick: () =>
        c.activeDoc && c.updateDoc(c.activeDoc.id, { language: l.id, dirty: true }),
    }));

    const settings: MenuItem[] = [
      {
        type: "item",
        label: "Tab size: 2",
        onClick: () => c.patchSession({ tabSize: 2 }),
      },
      {
        type: "item",
        label: "Tab size: 4",
        onClick: () => c.patchSession({ tabSize: 4 }),
      },
      {
        type: "item",
        label: c.session.insertSpaces ? "Insert spaces ✓" : "Insert spaces",
        onClick: () => c.patchSession({ insertSpaces: !c.session.insertSpaces }),
      },
      {
        type: "item",
        label: c.activeDoc?.readOnly ? "Read-only ✓" : "Read-only",
        onClick: () =>
          c.activeDoc &&
          c.updateDoc(c.activeDoc.id, { readOnly: !c.activeDoc.readOnly, dirty: true }),
      },
      { type: "separator" },
      { type: "item", label: "Reset session", onClick: c.resetSession },
    ];

    const macro: MenuItem[] = [
      {
        type: "item",
        label: c.macroRecording ? "Stop recording" : "Start recording",
        onClick: () => {
          if (c.macroRecording) c.stopMacro();
          else {
            c.setMacroSteps([]);
            c.setMacroRecording(true);
            c.flash("Macro recording…");
          }
        },
      },
      { type: "item", label: "Playback", onClick: c.playMacro },
      {
        type: "item",
        label: "Clear macro",
        onClick: () => {
          clearMacro();
          c.setMacroSteps([]);
          c.flash("Macro cleared");
        },
      },
    ];

    const tools: MenuItem[] = [
      { type: "item", label: "Base64 encode selection", onClick: () => c.runPlugin("base64-encode") },
      { type: "item", label: "Base64 decode selection", onClick: () => c.runPlugin("base64-decode") },
      { type: "item", label: "SHA-256 hash", onClick: () => c.runPlugin("hash-sha256") },
      { type: "item", label: "Format JSON", onClick: () => c.runPlugin("json-format") },
      { type: "item", label: "Insert UUID", onClick: () => c.runPlugin("uuid") },
      { type: "separator" },
      {
        type: "submenu",
        label: "Insert date/time",
        items: (
          [
            ["ISO timestamp", "iso"],
            ["Local date/time", "local"],
            ["Date only", "date"],
            ["Time only", "time"],
          ] as const
        ).map(([label, mode]) => ({
          type: "item" as const,
          label,
          onClick: () => c.insertDateTime(mode),
        })),
      },
      { type: "separator" },
      {
        type: "item",
        label: "Text diff (compare tab)",
        onClick: () => {
          const other = c.session.docs.find((d) => d.id !== c.activeDoc?.id);
          if (other && c.activeDoc) c.compareWithTab(other.id);
          else c.flash("Open a second tab to compare.");
        },
      },
      { type: "item", label: "Regex tester", onClick: () => window.open("/tools/regex-tester", "_blank") },
      { type: "item", label: "Find & replace tool", onClick: () => window.open("/tools/find-replace", "_blank") },
    ];

    const windowMenu: MenuItem[] = [
      ...c.session.docs.map((d) => ({
        type: "item" as const,
        label: d.id === c.session.activeId ? `● ${d.name}` : d.name,
        onClick: () => c.setActive(d.id),
      })),
      { type: "separator" },
      {
        type: "submenu",
        label: "Compare with tab",
        items: c.session.docs
          .filter((d) => d.id !== c.activeDoc?.id)
          .map((d) => ({
            type: "item" as const,
            label: d.name,
            onClick: () => c.compareWithTab(d.id),
          })),
      },
      { type: "separator" },
      {
        type: "item",
        label: "Save session as…",
        onClick: () => c.setSessionSaveOpen(true),
      },
      ...c.namedSessions.map((s) => ({
        type: "item" as const,
        label: `Load: ${s.name}`,
        onClick: () => c.loadNamedSession(s.name),
      })),
    ];

    const help: MenuItem[] = [
      { type: "item", label: "Keyboard shortcuts", onClick: () => c.flash("Ctrl+S save · Ctrl+N new · Ctrl+G go to · F11 full screen") },
      { type: "item", label: "Open full workspace", onClick: () => window.open("/notepad", "_blank") },
      { type: "item", label: "Project vault", onClick: () => window.open("/vault", "_blank") },
    ];

    return [
      { label: "File", items: file },
      { label: "Edit", items: edit },
      { label: "Search", items: search },
      { label: "View", items: view },
      { label: "Encoding", items: encoding },
      { label: "Language", items: language },
      { label: "Settings", items: settings },
      { label: "Macro", items: macro },
      { label: "Tools", items: tools },
      { label: "Window", items: windowMenu },
      { label: "Help", items: help },
    ];
  }, [c, transformSelection]);

  if (!c.activeDoc) return null;

  const outline = parseOutline(c.activeDoc.content);
  const shellClass = c.session.fullScreen
    ? "fixed inset-0 z-50 flex flex-col bg-background"
    : mode === "workspace"
      ? "flex h-[calc(100dvh-3.5rem)] flex-col bg-background"
      : "flex min-h-[70vh] flex-col bg-background";

  return (
    <div className={shellClass}>
      {mode === "compact" && tool && (
        <div className="mx-auto w-full max-w-[1600px] px-4 pt-6">
          <ToolPageHero tool={tool} />
          <div className="mb-2 flex items-center justify-end gap-2 text-xs">
            <Link
              href="/notepad"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              Open full workspace
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      <div
        className={`flex min-h-0 flex-1 flex-col ${
          mode === "compact" ? "mx-auto w-full max-w-[1600px] px-4 pb-6" : ""
        }`}
      >
        {c.session.showToolbar && (
          <div className="flex flex-wrap items-center gap-1 border border-border bg-card px-2 py-1 text-xs">
            <QuickBtn label="New" onClick={c.newDoc} />
            <QuickBtn label="Open" onClick={() => c.fileInputRef.current?.click()} />
            <QuickBtn label="Save" onClick={() => c.saveDoc(c.activeDoc!)} />
            <QuickBtn label="Find" onClick={c.focusFind} />
            <QuickBtn
              label="Wrap"
              active={c.session.wordWrap}
              onClick={() => c.patchSession({ wordWrap: !c.session.wordWrap })}
            />
            <span className="mx-1 h-4 w-px bg-border" />
            <button
              type="button"
              onClick={c.copyAll}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-muted-foreground hover:bg-muted"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
            <button
              type="button"
              onClick={() => {
                c.shareActive();
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-muted-foreground hover:bg-muted"
            >
              {shareCopied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Share2 className="h-3 w-3" />
              )}
              Share
            </button>
            <VaultSaveButton
              toolSlug={NOTEPAD_TOOL_SLUG}
              getContent={() => c.activeDoc!.content}
              defaultTitle={`${c.activeDoc!.name} — ${new Date().toLocaleDateString()}`}
            />
            <Link
              href="/vault"
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-muted-foreground hover:bg-muted"
            >
              <Save className="h-3 w-3" /> Vault
            </Link>
            <button
              type="button"
              onClick={() => c.patchSession({ showSidePanel: !c.session.showSidePanel })}
              className={`ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 ${
                c.session.showSidePanel ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted"
              }`}
              title="Toggle side panel"
            >
              <PanelLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => c.patchSession({ fullScreen: !c.session.fullScreen })}
              className="inline-flex items-center rounded px-2 py-0.5 text-muted-foreground hover:bg-muted"
              title="Full screen (F11)"
            >
              {c.session.fullScreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <NotepadMenuBar menus={menuItems} />

          <div className="flex items-center gap-0 overflow-x-auto border-b border-border bg-muted/40 px-1">
            {c.session.docs.map((doc) => (
              <TabButton
                key={doc.id}
                doc={doc}
                active={doc.id === c.session.activeId}
                onSelect={() => c.setActive(doc.id)}
                onClose={() => c.closeDoc(doc.id)}
              />
            ))}
            <button
              type="button"
              onClick={c.newDoc}
              className="shrink-0 px-2 py-1 text-muted-foreground hover:text-foreground"
              title="New tab"
            >
              +
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            {c.session.showSidePanel && (
              <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-muted/20 text-xs">
                <div className="flex border-b border-border">
                  {(
                    [
                      ["docs", "Docs"],
                      ["outline", "Outline"],
                      ["bookmarks", "Marks"],
                      ["recent", "Recent"],
                      ["chars", "Chars"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => c.setSidePanel(id)}
                      className={`flex-1 px-1 py-1.5 ${
                        c.session.sidePanel === id
                          ? "bg-card font-semibold text-foreground"
                          : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  <SidePanelContent
                    panel={c.session.sidePanel}
                    docs={c.session.docs}
                    activeId={c.session.activeId}
                    bookmarks={c.activeDoc.bookmarks}
                    recent={c.recentFiles}
                    outline={outline}
                    onSelectDoc={c.setActive}
                    onOpenRecent={c.openRecent}
                    onGotoLine={(line) => {
                      const ed = c.activeEditor();
                      ed?.revealLineInCenter(line);
                      ed?.setPosition({ lineNumber: line, column: 1 });
                      ed?.focus();
                    }}
                    onInsertChar={(ch) => {
                      const ed = c.activeEditor();
                      if (ed) replaceSelection(ed, ch);
                    }}
                  />
                </div>
              </aside>
            )}

            <div
              className={`grid min-h-0 flex-1 ${
                c.session.splitMode === "vertical"
                  ? "grid-cols-2"
                  : c.session.splitMode === "horizontal"
                    ? "grid-rows-2"
                    : "grid-cols-1"
              }`}
            >
              <EditorPane
                doc={c.activeDoc}
                session={c.session}
                dark={dark}
                label="Primary"
                onChange={(v) => c.updateDoc(c.activeDoc!.id, { content: v ?? "", dirty: true })}
                onMount={c.mountEditor("primary")}
              />
              {c.session.splitMode !== "none" && c.secondaryDoc && (
                <EditorPane
                  doc={c.secondaryDoc}
                  session={c.session}
                  dark={dark}
                  label={c.secondaryDoc.name}
                  onChange={(v) =>
                    c.updateDoc(c.secondaryDoc!.id, { content: v ?? "", dirty: true })
                  }
                  onMount={c.mountEditor("secondary")}
                />
              )}
            </div>
          </div>

          {c.session.showStatusBar && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-muted/50 px-3 py-1 font-mono text-[11px] text-muted-foreground">
              <span>
                Ln {c.cursor.line}, Col {c.cursor.column}
              </span>
              {c.selectionLen > 0 && <span>Sel {c.selectionLen}</span>}
              <span>{countLines(c.activeDoc.content)} lines</span>
              <span>{c.activeDoc.content.length} chars</span>
              <span>{c.labelForLanguage(c.activeDoc.language)}</span>
              <span>{c.activeDoc.eol}</span>
              <span>{c.encodingLabel(c.activeDoc.encoding)}</span>
              {c.activeDoc.readOnly && <span>RO</span>}
              {c.activeDoc.dirty && (
                <span className="text-amber-600 dark:text-amber-400">Modified</span>
              )}
              {c.macroRecording && (
                <span className="text-red-600 dark:text-red-400">REC</span>
              )}
              {c.message && <span className="ml-auto text-foreground">{c.message}</span>}
            </div>
          )}
        </div>
      </div>

      <input
        ref={c.fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.html,.css,.xml,.yaml,.yml,.sql,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.rb,.sh,.ps1,.ini,.lua,.kt,.swift,.r,.pl,.vb,.bat,.graphql,.hbs,.redis,text/*"
        className="hidden"
        onChange={(e) => void c.onOpenFiles(e.target.files)}
      />

      {c.goToOpen && <GoToDialog c={c} />}
      {c.sessionSaveOpen && (
        <NameDialog
          title="Save session as"
          value={c.sessionName}
          onChange={c.setSessionName}
          onCancel={() => c.setSessionSaveOpen(false)}
          onConfirm={() => c.saveNamedSession(c.sessionName.trim() || "session")}
        />
      )}
      {c.renameOpen && c.activeDoc && (
        <NameDialog
          title="Rename document"
          value={c.renameValue}
          onChange={c.setRenameValue}
          onCancel={() => c.setRenameOpen(false)}
          onConfirm={() => {
            c.updateDoc(c.activeDoc!.id, { name: c.renameValue.trim() || c.activeDoc!.name });
            c.setRenameOpen(false);
          }}
        />
      )}
    </div>
  );
}

function EditorPane({
  doc,
  session,
  dark,
  label,
  onChange,
  onMount,
}: {
  doc: NotepadDocument;
  session: ReturnType<typeof useNotepadController>["session"];
  dark: boolean;
  label: string;
  onChange: (v: string | undefined) => void;
  onMount: (ed: MonacoEditor.IStandaloneCodeEditor) => void;
}) {
  return (
    <div className="relative flex min-h-[240px] min-w-0 flex-col">
      <div className="absolute left-2 top-1 z-10 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
        {label}
      </div>
      <Monaco
        key={doc.id}
        language={doc.language}
        theme={dark ? "vs-dark" : "vs"}
        value={doc.content}
        onChange={onChange}
        onMount={onMount}
        options={{
          automaticLayout: true,
          readOnly: doc.readOnly,
          wordWrap: session.wordWrap ? "on" : "off",
          minimap: { enabled: session.minimap },
          lineNumbers: session.lineNumbers ? "on" : "off",
          renderWhitespace: session.renderWhitespace,
          fontSize: session.fontSize,
          tabSize: session.tabSize,
          insertSpaces: session.insertSpaces,
          scrollBeyondLastLine: false,
          folding: true,
          bracketPairColorization: { enabled: true },
          guides: { indentation: true, bracketPairs: true },
          smoothScrolling: true,
          glyphMargin: true,
        }}
      />
    </div>
  );
}

function SidePanelContent({
  panel,
  docs,
  activeId,
  bookmarks,
  recent,
  outline,
  onSelectDoc,
  onOpenRecent,
  onGotoLine,
  onInsertChar,
}: {
  panel: string;
  docs: NotepadDocument[];
  activeId: string;
  bookmarks: number[];
  recent: { name: string }[];
  outline: { line: number; text: string }[];
  onSelectDoc: (id: string) => void;
  onOpenRecent: (name: string) => void;
  onGotoLine: (line: number) => void;
  onInsertChar: (ch: string) => void;
}) {
  if (panel === "docs") {
    return (
      <ul className="space-y-0.5">
        {docs.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onSelectDoc(d.id)}
              className={`w-full truncate rounded px-1 py-0.5 text-left hover:bg-muted ${
                d.id === activeId ? "bg-muted font-medium" : ""
              }`}
            >
              {d.dirty ? "● " : ""}
              {d.name}
            </button>
          </li>
        ))}
      </ul>
    );
  }
  if (panel === "outline") {
    return outline.length ? (
      <ul className="space-y-0.5 font-mono text-[10px]">
        {outline.map((o) => (
          <li key={o.line}>
            <button type="button" onClick={() => onGotoLine(o.line)} className="w-full truncate text-left hover:underline">
              {o.text}
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted-foreground">No headings or functions detected.</p>
    );
  }
  if (panel === "bookmarks") {
    return bookmarks.length ? (
      <ul className="space-y-0.5 font-mono">
        {bookmarks.map((line) => (
          <li key={line}>
            <button type="button" onClick={() => onGotoLine(line)} className="hover:underline">
              Line {line}
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted-foreground">No bookmarks. Toggle at cursor via Search menu.</p>
    );
  }
  if (panel === "recent") {
    return recent.length ? (
      <ul className="space-y-0.5">
        {recent.map((f) => (
          <li key={f.name}>
            <button
              type="button"
              onClick={() => onOpenRecent(f.name)}
              className="w-full truncate text-left hover:underline"
            >
              {f.name}
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted-foreground">No recent files.</p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1 font-serif text-base">
      {CHAR_MAP.split("").map((ch) => (
        <button
          key={ch}
          type="button"
          onClick={() => onInsertChar(ch)}
          className="rounded border border-border px-1 hover:bg-muted"
          title={`Insert ${ch}`}
        >
          {ch}
        </button>
      ))}
    </div>
  );
}

function GoToDialog({ c }: { c: ReturnType<typeof useNotepadController> }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-[20vh]">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
        <h3 className="text-sm font-semibold">Go to line</h3>
        <input
          autoFocus
          type="number"
          min={1}
          value={c.goToLine}
          onChange={(e) => c.setGoToLine(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") c.runGoToLine();
            if (e.key === "Escape") c.setGoToOpen(false);
          }}
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
          placeholder="Line number"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => c.setGoToOpen(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={c.runGoToLine}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

function NameDialog({
  title,
  value,
  onChange,
  onCancel,
  onConfirm,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-[20vh]">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
        <h3 className="text-sm font-semibold">{title}</h3>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm();
            if (e.key === "Escape") onCancel();
          }}
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  doc,
  active,
  onSelect,
  onClose,
}: {
  doc: NotepadDocument;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex max-w-[180px] shrink-0 items-center gap-1 px-3 py-1.5 text-xs ${
        active ? "bg-card font-medium text-foreground" : "text-muted-foreground hover:bg-muted/50"
      }`}
    >
      <span className="truncate">
        {doc.dirty ? "● " : ""}
        {doc.name}
      </span>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="rounded p-0.5 opacity-60 hover:text-destructive hover:opacity-100"
        aria-label={`Close ${doc.name}`}
      >
        <X className="h-3 w-3" />
      </span>
    </button>
  );
}

function QuickBtn({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-0.5 ${
        active ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}
