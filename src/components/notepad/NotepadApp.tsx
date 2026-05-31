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
  const { fileInputRef, activeEditor, ...np } = useNotepadController();
  const dark = useIsDark();
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    ensureMonaco();
  }, []);

  const transformSelection = useCallback(
    (mode: "upper" | "lower" | "title") => {
      const ed = activeEditor();
      const sel = getSelectionText(ed);
      if (!sel) return;
      let next = sel;
      if (mode === "upper") next = sel.toUpperCase();
      else if (mode === "lower") next = sel.toLowerCase();
      else next = sel.replace(/\b\w/g, (ch) => ch.toUpperCase());
      replaceSelection(ed, next);
    },
    [activeEditor],
  );

  const menuItems = useMemo(() => {
    const file: MenuItem[] = [
      { type: "item", label: "New", shortcut: "Ctrl+N", onClick: np.newDoc },
      { type: "item", label: "Open…", shortcut: "Ctrl+O", onClick: () => fileInputRef.current?.click() },
      { type: "separator" },
      {
        type: "item",
        label: "Save / Download",
        shortcut: "Ctrl+S",
        onClick: () => np.activeDoc && np.saveDoc(np.activeDoc),
      },
      {
        type: "item",
        label: "Save As…",
        shortcut: "Ctrl+Shift+S",
        onClick: () => np.activeDoc && np.saveDoc(np.activeDoc, true),
      },
      { type: "item", label: "Save All", onClick: np.saveAll },
      { type: "item", label: "Rename…", onClick: () => {
          if (np.activeDoc) {
            np.setRenameValue(np.activeDoc.name);
            np.setRenameOpen(true);
          }
        }},
      { type: "separator" },
      {
        type: "item",
        label: "Close",
        shortcut: "Ctrl+W",
        onClick: () => np.activeDoc && np.closeDoc(np.activeDoc.id),
      },
      { type: "item", label: "Close Others", onClick: np.closeOthers },
      { type: "item", label: "Close All", onClick: np.closeAll },
      { type: "separator" },
      { type: "item", label: "Print", onClick: np.printActive },
      { type: "separator" },
      {
        type: "submenu",
        label: "Recent files",
        items: np.recentFiles.length
          ? np.recentFiles.map((f) => ({
              type: "item" as const,
              label: f.name,
              onClick: () => np.openRecent(f.name),
            }))
          : [{ type: "item" as const, label: "(empty)", disabled: true, onClick: () => {} }],
      },
      { type: "item", label: "Clear recent list", onClick: np.clearRecentFiles },
    ];

    const edit: MenuItem[] = [
      { type: "item", label: "Undo", shortcut: "Ctrl+Z", onClick: np.undo },
      { type: "item", label: "Redo", shortcut: "Ctrl+Y", onClick: np.redo },
      { type: "separator" },
      { type: "item", label: "Cut", shortcut: "Ctrl+X", onClick: () => document.execCommand("cut") },
      { type: "item", label: "Copy", shortcut: "Ctrl+C", onClick: () => document.execCommand("copy") },
      { type: "item", label: "Paste", shortcut: "Ctrl+V", onClick: () => document.execCommand("paste") },
      { type: "item", label: "Select All", shortcut: "Ctrl+A", onClick: np.selectAll },
      { type: "separator" },
      { type: "item", label: "Duplicate line", onClick: np.duplicateLine },
      { type: "item", label: "Delete line", onClick: np.deleteLine },
      { type: "item", label: "Move line up", onClick: np.moveLineUp },
      { type: "item", label: "Move line down", onClick: np.moveLineDown },
      { type: "item", label: "Join lines", onClick: np.joinLines },
      { type: "item", label: "Transpose chars", onClick: np.transposeChars },
      { type: "separator" },
      { type: "item", label: "Toggle comment", onClick: np.toggleComment },
      { type: "item", label: "Increase indent", onClick: np.indent },
      { type: "item", label: "Decrease indent", onClick: np.unindent },
      { type: "separator" },
      { type: "item", label: "Trim trailing space", onClick: np.trimTrailing },
      { type: "item", label: "Trim leading space", onClick: np.trimLeading },
      { type: "item", label: "Remove empty lines", onClick: np.removeEmpty },
      { type: "item", label: "Sort lines", onClick: () => np.sortLines() },
      { type: "item", label: "Reverse lines", onClick: np.reverseLines },
      { type: "separator" },
      { type: "item", label: "UPPERCASE", onClick: () => transformSelection("upper") },
      { type: "item", label: "lowercase", onClick: () => transformSelection("lower") },
      { type: "item", label: "Title Case", onClick: () => transformSelection("title") },
    ];

    const search: MenuItem[] = [
      { type: "item", label: "Find…", shortcut: "Ctrl+F", onClick: np.focusFind },
      { type: "item", label: "Replace…", shortcut: "Ctrl+H", onClick: np.focusReplace },
      { type: "item", label: "Go to line…", shortcut: "Ctrl+G", onClick: () => np.setGoToOpen(true) },
      { type: "separator" },
      { type: "item", label: "Toggle bookmark", onClick: np.toggleBookmarkAtCursor },
      { type: "item", label: "Next bookmark", onClick: () => np.gotoBookmark("next") },
      { type: "item", label: "Previous bookmark", onClick: () => np.gotoBookmark("prev") },
    ];

    const view: MenuItem[] = [
      {
        type: "item",
        label: np.session.wordWrap ? "Word wrap ✓" : "Word wrap",
        onClick: () => np.patchSession({ wordWrap: !np.session.wordWrap }),
      },
      {
        type: "item",
        label: np.session.minimap ? "Minimap ✓" : "Minimap",
        onClick: () => np.patchSession({ minimap: !np.session.minimap }),
      },
      {
        type: "item",
        label: np.session.lineNumbers ? "Line numbers ✓" : "Line numbers",
        onClick: () => np.patchSession({ lineNumbers: !np.session.lineNumbers }),
      },
      {
        type: "submenu",
        label: "Show whitespace",
        items: (["none", "selection", "all"] as const).map((w) => ({
          type: "item" as const,
          label: w === np.session.renderWhitespace ? `${w} ✓` : w,
          onClick: () => np.patchSession({ renderWhitespace: w }),
        })),
      },
      { type: "separator" },
      { type: "item", label: "Split vertical", onClick: () => np.toggleSplit("vertical") },
      { type: "item", label: "Split horizontal", onClick: () => np.toggleSplit("horizontal") },
      { type: "item", label: "Close split", onClick: () => np.toggleSplit("none") },
      { type: "item", label: "Clone to other view", onClick: np.cloneToOtherView },
      { type: "separator" },
      {
        type: "item",
        label: np.session.showSidePanel ? "Hide side panel" : "Show side panel",
        onClick: () => np.patchSession({ showSidePanel: !np.session.showSidePanel }),
      },
      { type: "item", label: "Full screen", shortcut: "F11", onClick: () => np.patchSession({ fullScreen: !np.session.fullScreen }) },
      { type: "separator" },
      { type: "item", label: "Zoom in", onClick: () => np.patchSession({ fontSize: Math.min(28, np.session.fontSize + 1) }) },
      { type: "item", label: "Zoom out", onClick: () => np.patchSession({ fontSize: Math.max(10, np.session.fontSize - 1) }) },
      { type: "item", label: "Fold all", onClick: np.foldAll },
      { type: "item", label: "Unfold all", onClick: np.unfoldAll },
    ];

    const encoding: MenuItem[] = (["utf-8", "utf-8-bom", "utf-16le-bom"] as NotepadEncoding[]).map(
      (enc) => ({
        type: "item" as const,
        label:
          np.activeDoc?.encoding === enc
            ? `${np.encodingLabel(enc)} ✓`
            : np.encodingLabel(enc),
        onClick: () =>
          np.activeDoc && np.updateDoc(np.activeDoc.id, { encoding: enc, dirty: true }),
      }),
    );

    const language: MenuItem[] = NOTEPAD_LANGUAGES.map((l) => ({
      type: "item" as const,
      label: np.activeDoc?.language === l.id ? `${l.label} ✓` : l.label,
      onClick: () =>
        np.activeDoc && np.updateDoc(np.activeDoc.id, { language: l.id, dirty: true }),
    }));

    const settings: MenuItem[] = [
      {
        type: "item",
        label: "Tab size: 2",
        onClick: () => np.patchSession({ tabSize: 2 }),
      },
      {
        type: "item",
        label: "Tab size: 4",
        onClick: () => np.patchSession({ tabSize: 4 }),
      },
      {
        type: "item",
        label: np.session.insertSpaces ? "Insert spaces ✓" : "Insert spaces",
        onClick: () => np.patchSession({ insertSpaces: !np.session.insertSpaces }),
      },
      {
        type: "item",
        label: np.activeDoc?.readOnly ? "Read-only ✓" : "Read-only",
        onClick: () =>
          np.activeDoc &&
          np.updateDoc(np.activeDoc.id, { readOnly: !np.activeDoc.readOnly, dirty: true }),
      },
      { type: "separator" },
      { type: "item", label: "Reset session", onClick: np.resetSession },
    ];

    const macro: MenuItem[] = [
      {
        type: "item",
        label: np.macroRecording ? "Stop recording" : "Start recording",
        onClick: () => {
          if (np.macroRecording) np.stopMacro();
          else {
            np.setMacroSteps([]);
            np.setMacroRecording(true);
            np.flash("Macro recording…");
          }
        },
      },
      { type: "item", label: "Playback", onClick: np.playMacro },
      {
        type: "item",
        label: "Clear macro",
        onClick: () => {
          clearMacro();
          np.setMacroSteps([]);
          np.flash("Macro cleared");
        },
      },
    ];

    const tools: MenuItem[] = [
      { type: "item", label: "Base64 encode selection", onClick: () => np.runPlugin("base64-encode") },
      { type: "item", label: "Base64 decode selection", onClick: () => np.runPlugin("base64-decode") },
      { type: "item", label: "SHA-256 hash", onClick: () => np.runPlugin("hash-sha256") },
      { type: "item", label: "Format JSON", onClick: () => np.runPlugin("json-format") },
      { type: "item", label: "Insert UUID", onClick: () => np.runPlugin("uuid") },
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
          onClick: () => np.insertDateTime(mode),
        })),
      },
      { type: "separator" },
      {
        type: "item",
        label: "Text diff (compare tab)",
        onClick: () => {
          const other = np.session.docs.find((d) => d.id !== np.activeDoc?.id);
          if (other && np.activeDoc) np.compareWithTab(other.id);
          else np.flash("Open a second tab to compare.");
        },
      },
      { type: "item", label: "Regex tester", onClick: () => window.open("/tools/regex-tester", "_blank") },
      { type: "item", label: "Find & replace tool", onClick: () => window.open("/tools/find-replace", "_blank") },
    ];

    const windowMenu: MenuItem[] = [
      ...np.session.docs.map((d) => ({
        type: "item" as const,
        label: d.id === np.session.activeId ? `● ${d.name}` : d.name,
        onClick: () => np.setActive(d.id),
      })),
      { type: "separator" },
      {
        type: "submenu",
        label: "Compare with tab",
        items: np.session.docs
          .filter((d) => d.id !== np.activeDoc?.id)
          .map((d) => ({
            type: "item" as const,
            label: d.name,
            onClick: () => np.compareWithTab(d.id),
          })),
      },
      { type: "separator" },
      {
        type: "item",
        label: "Save session as…",
        onClick: () => np.setSessionSaveOpen(true),
      },
      ...np.namedSessions.map((s) => ({
        type: "item" as const,
        label: `Load: ${s.name}`,
        onClick: () => np.loadNamedSession(s.name),
      })),
    ];

    const help: MenuItem[] = [
      { type: "item", label: "Keyboard shortcuts", onClick: () => np.flash("Ctrl+S save · Ctrl+N new · Ctrl+G go to · F11 full screen") },
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
  }, [np, transformSelection]);

  if (!np.activeDoc) return null;

  const outline = parseOutline(np.activeDoc.content);
  const shellClass = np.session.fullScreen
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
        {np.session.showToolbar && (
          <div className="flex flex-wrap items-center gap-1 border border-border bg-card px-2 py-1 text-xs">
            <QuickBtn label="New" onClick={np.newDoc} />
            <QuickBtn label="Open" onClick={() => fileInputRef.current?.click()} />
            <QuickBtn label="Save" onClick={() => np.saveDoc(np.activeDoc!)} />
            <QuickBtn label="Find" onClick={np.focusFind} />
            <QuickBtn
              label="Wrap"
              active={np.session.wordWrap}
              onClick={() => np.patchSession({ wordWrap: !np.session.wordWrap })}
            />
            <span className="mx-1 h-4 w-px bg-border" />
            <button
              type="button"
              onClick={np.copyAll}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-muted-foreground hover:bg-muted"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
            <button
              type="button"
              onClick={() => {
                np.shareActive();
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
              getContent={() => np.activeDoc!.content}
              defaultTitle={`${np.activeDoc!.name} — ${new Date().toLocaleDateString()}`}
            />
            <Link
              href="/vault"
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-muted-foreground hover:bg-muted"
            >
              <Save className="h-3 w-3" /> Vault
            </Link>
            <button
              type="button"
              onClick={() => np.patchSession({ showSidePanel: !np.session.showSidePanel })}
              className={`ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 ${
                np.session.showSidePanel ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted"
              }`}
              title="Toggle side panel"
            >
              <PanelLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => np.patchSession({ fullScreen: !np.session.fullScreen })}
              className="inline-flex items-center rounded px-2 py-0.5 text-muted-foreground hover:bg-muted"
              title="Full screen (F11)"
            >
              {np.session.fullScreen ? (
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
            {np.session.docs.map((doc) => (
              <TabButton
                key={doc.id}
                doc={doc}
                active={doc.id === np.session.activeId}
                onSelect={() => np.setActive(doc.id)}
                onClose={() => np.closeDoc(doc.id)}
              />
            ))}
            <button
              type="button"
              onClick={np.newDoc}
              className="shrink-0 px-2 py-1 text-muted-foreground hover:text-foreground"
              title="New tab"
            >
              +
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            {np.session.showSidePanel && (
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
                      onClick={() => np.setSidePanel(id)}
                      className={`flex-1 px-1 py-1.5 ${
                        np.session.sidePanel === id
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
                    panel={np.session.sidePanel}
                    docs={np.session.docs}
                    activeId={np.session.activeId}
                    bookmarks={np.activeDoc.bookmarks}
                    recent={np.recentFiles}
                    outline={outline}
                    onSelectDoc={np.setActive}
                    onOpenRecent={np.openRecent}
                    onGotoLine={(line) => {
                      const ed = activeEditor();
                      ed?.revealLineInCenter(line);
                      ed?.setPosition({ lineNumber: line, column: 1 });
                      ed?.focus();
                    }}
                    onInsertChar={(ch) => {
                      const ed = activeEditor();
                      if (ed) replaceSelection(ed, ch);
                    }}
                  />
                </div>
              </aside>
            )}

            <div
              className={`grid min-h-0 flex-1 ${
                np.session.splitMode === "vertical"
                  ? "grid-cols-2"
                  : np.session.splitMode === "horizontal"
                    ? "grid-rows-2"
                    : "grid-cols-1"
              }`}
            >
              <EditorPane
                doc={np.activeDoc}
                session={np.session}
                dark={dark}
                label="Primary"
                onChange={(v) => np.updateDoc(np.activeDoc!.id, { content: v ?? "", dirty: true })}
                onMount={np.mountEditor("primary")}
              />
              {np.session.splitMode !== "none" && np.secondaryDoc && (
                <EditorPane
                  doc={np.secondaryDoc}
                  session={np.session}
                  dark={dark}
                  label={np.secondaryDoc.name}
                  onChange={(v) =>
                    np.updateDoc(np.secondaryDoc!.id, { content: v ?? "", dirty: true })
                  }
                  onMount={np.mountEditor("secondary")}
                />
              )}
            </div>
          </div>

          {np.session.showStatusBar && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-muted/50 px-3 py-1 font-mono text-[11px] text-muted-foreground">
              <span>
                Ln {np.cursor.line}, Col {np.cursor.column}
              </span>
              {np.selectionLen > 0 && <span>Sel {np.selectionLen}</span>}
              <span>{countLines(np.activeDoc.content)} lines</span>
              <span>{np.activeDoc.content.length} chars</span>
              <span>{np.labelForLanguage(np.activeDoc.language)}</span>
              <span>{np.activeDoc.eol}</span>
              <span>{np.encodingLabel(np.activeDoc.encoding)}</span>
              {np.activeDoc.readOnly && <span>RO</span>}
              {np.activeDoc.dirty && (
                <span className="text-amber-600 dark:text-amber-400">Modified</span>
              )}
              {np.macroRecording && (
                <span className="text-red-600 dark:text-red-400">REC</span>
              )}
              {np.message && <span className="ml-auto text-foreground">{np.message}</span>}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.html,.css,.xml,.yaml,.yml,.sql,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.rb,.sh,.ps1,.ini,.lua,.kt,.swift,.r,.pl,.vb,.bat,.graphql,.hbs,.redis,text/*"
        className="hidden"
        onChange={(e) => void np.onOpenFiles(e.target.files)}
      />

      {np.goToOpen && (
        <GoToDialog
          goToLine={np.goToLine}
          setGoToLine={np.setGoToLine}
          runGoToLine={np.runGoToLine}
          onClose={() => np.setGoToOpen(false)}
        />
      )}
      {np.sessionSaveOpen && (
        <NameDialog
          title="Save session as"
          value={np.sessionName}
          onChange={np.setSessionName}
          onCancel={() => np.setSessionSaveOpen(false)}
          onConfirm={() => np.saveNamedSession(np.sessionName.trim() || "session")}
        />
      )}
      {np.renameOpen && np.activeDoc && (
        <NameDialog
          title="Rename document"
          value={np.renameValue}
          onChange={np.setRenameValue}
          onCancel={() => np.setRenameOpen(false)}
          onConfirm={() => {
            np.updateDoc(np.activeDoc!.id, { name: np.renameValue.trim() || np.activeDoc!.name });
            np.setRenameOpen(false);
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

function GoToDialog({
  goToLine,
  setGoToLine,
  runGoToLine,
  onClose,
}: {
  goToLine: string;
  setGoToLine: (v: string) => void;
  runGoToLine: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-[20vh]">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
        <h3 className="text-sm font-semibold">Go to line</h3>
        <input
          autoFocus
          type="number"
          min={1}
          value={goToLine}
          onChange={(e) => setGoToLine(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runGoToLine();
            if (e.key === "Escape") onClose();
          }}
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
          placeholder="Line number"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={runGoToLine}
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
