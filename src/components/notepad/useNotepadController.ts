"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { editor as MonacoEditor } from "monaco-editor";
import {
  applyEol,
  createDocument,
  defaultSession,
  loadNotepadSession,
  nextUntitledName,
  NOTEPAD_TOOL_SLUG,
  saveNotepadSession,
  type NotepadDocument,
  type NotepadSession,
  type NotepadSidePanel,
  type NotepadSplitMode,
} from "@/lib/notepad-session";
import {
  detectLanguageFromFilename,
  extensionForLanguage,
  labelForLanguage,
} from "@/lib/notepad-languages";
import { encodeText, encodingLabel } from "@/lib/notepad/encoding";
import { pushRecentFile, loadRecentFiles, clearRecentFiles } from "@/lib/notepad/recent-files";
import {
  deleteNamedSession,
  listNamedSessions,
  loadNamedSession,
  saveNamedSession,
} from "@/lib/notepad/named-sessions";
import {
  loadMacro,
  saveMacro,
  type MacroStep,
} from "@/lib/notepad/macros";
import {
  duplicateLine,
  deleteLine,
  getSelectionText,
  joinLines,
  moveLineDown,
  moveLineUp,
  nextBookmark,
  prevBookmark,
  replaceSelection,
  runEditorAction,
  toggleBookmark,
  transposeChars,
} from "@/lib/notepad/editor-actions";
import {
  formatDateTime,
  indentLines,
  removeEmptyLines,
  reverseLines,
  sortLines,
  toggleLineComment,
  trimLeadingWhitespace,
  trimTrailingWhitespace,
  unindentLines,
} from "@/lib/notepad/transforms";
import {
  decodeSharedToolState,
  encodeSharedToolState,
  sharePayloadTooLong,
} from "@/lib/shareable-tool-state";
import { vaultGet } from "@/lib/devbench-vault";
import { trackToolCopy, trackToolDownload, trackToolShareLink } from "@/lib/analytics-events";
import {
  base64Decode,
  base64Encode,
  generateHash,
  generateUuids,
} from "@/lib/tool-engines";

type EngineResult = string | { output: string; error?: string };

function resultText(r: EngineResult): string {
  return typeof r === "string" ? r : r.output;
}

function resultError(r: EngineResult): string | undefined {
  return typeof r === "string" ? undefined : r.error;
}

export function useNotepadController() {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<NotepadSession>(() => defaultSession());
  const [hydrated, setHydrated] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [selectionLen, setSelectionLen] = useState(0);
  const [message, setMessage] = useState("");
  const [goToLine, setGoToLine] = useState("");
  const [goToOpen, setGoToOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [sessionSaveOpen, setSessionSaveOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [macroRecording, setMacroRecording] = useState(false);
  const [macroSteps, setMacroSteps] = useState<MacroStep[]>([]);
  const [recentFiles, setRecentFiles] = useState(loadRecentFiles());
  const [namedSessions, setNamedSessions] = useState(listNamedSessions());

  const primaryRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const secondaryRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeEditorRef = useRef<"primary" | "secondary">("primary");

  const activeDoc = useMemo(
    () => session.docs.find((d) => d.id === session.activeId) ?? session.docs[0],
    [session],
  );

  const secondaryDoc = useMemo(
    () =>
      session.secondaryDocId
        ? session.docs.find((d) => d.id === session.secondaryDocId) ?? null
        : null,
    [session],
  );

  const activeEditor = () =>
    activeEditorRef.current === "secondary" && secondaryRef.current
      ? secondaryRef.current
      : primaryRef.current;

  const updateDoc = useCallback((id: string, patch: Partial<NotepadDocument>) => {
    setSession((s) => ({
      ...s,
      docs: s.docs.map((d) => (d.id === id ? { ...d, ...patch, dirty: patch.dirty ?? true } : d)),
    }));
  }, []);

  const patchSession = useCallback((patch: Partial<NotepadSession>) => {
    setSession((s) => ({ ...s, ...patch }));
  }, []);

  const setActive = useCallback((id: string) => {
    setSession((s) => ({ ...s, activeId: id }));
    activeEditorRef.current = "primary";
  }, []);

  useEffect(() => {
    const saved = loadNotepadSession();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const shared = hash ? decodeSharedToolState(hash) : null;
    if (shared?.i) {
      const doc = createDocument({ name: "shared", content: shared.i, dirty: false });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate session from localStorage / URL hash once on mount
      setSession({
        ...(saved ?? defaultSession()),
        docs: [...(saved?.docs ?? [createDocument()]), doc],
        activeId: doc.id,
      });
    } else if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate session from localStorage once on mount
      setSession(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const vaultId = searchParams.get("vault");
    if (!vaultId || !hydrated) return;
    void vaultGet(vaultId).then((entry) => {
      if (!entry) return;
      const doc = createDocument({
        name: entry.title || "vault",
        content: entry.content,
        language: detectLanguageFromFilename(entry.title),
        dirty: false,
      });
      setSession((s) => ({ ...s, docs: [...s.docs, doc], activeId: doc.id }));
    });
  }, [searchParams, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveNotepadSession(session);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [session, hydrated]);

  const flash = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  }, []);

  const recordMacro = useCallback(
    (step: MacroStep) => {
      if (!macroRecording) return;
      setMacroSteps((s) => [...s, step]);
    },
    [macroRecording],
  );

  const newDoc = useCallback(() => {
    setSession((s) => {
      const doc = createDocument({ name: nextUntitledName(s.docs) });
      return { ...s, docs: [...s.docs, doc], activeId: doc.id };
    });
  }, []);

  const closeDoc = useCallback(
    (id: string, force = false) => {
      const doc = session.docs.find((d) => d.id === id);
      if (doc?.dirty && !force && !window.confirm(`Close "${doc.name}" without saving?`)) {
        return;
      }
      setSession((s) => {
        if (s.docs.length <= 1) {
          const fresh = createDocument({ name: "new 1" });
          return { ...s, docs: [fresh], activeId: fresh.id, secondaryDocId: null, splitMode: "none" };
        }
        const idx = s.docs.findIndex((d) => d.id === id);
        const docs = s.docs.filter((d) => d.id !== id);
        let activeId = s.activeId;
        if (s.activeId === id) activeId = docs[Math.max(0, idx - 1)]?.id ?? docs[0].id;
        let secondaryDocId = s.secondaryDocId;
        if (s.secondaryDocId === id) {
          secondaryDocId = null;
        }
        return {
          ...s,
          docs,
          activeId,
          secondaryDocId,
          splitMode: secondaryDocId ? s.splitMode : "none",
        };
      });
    },
    [session.docs],
  );

  const closeOthers = useCallback(() => {
    if (!activeDoc) return;
    setSession((s) => ({
      ...s,
      docs: s.docs.filter((d) => d.id === activeDoc.id),
      secondaryDocId: null,
      splitMode: "none",
    }));
  }, [activeDoc]);

  const closeAll = useCallback(() => {
    if (!window.confirm("Close all tabs?")) return;
    setSession(defaultSession());
  }, []);

  const onOpenFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const added: NotepadDocument[] = [];
      for (const file of Array.from(files)) {
        try {
          const content = await file.text();
          pushRecentFile(file.name, content);
          added.push(
            createDocument({
              name: file.name,
              content,
              language: detectLanguageFromFilename(file.name),
              dirty: false,
            }),
          );
        } catch {
          flash(`Could not read ${file.name}`);
        }
      }
      setRecentFiles(loadRecentFiles());
      if (!added.length) return;
      setSession((s) => ({
        ...s,
        docs: [...s.docs, ...added].slice(-32),
        activeId: added[added.length - 1].id,
      }));
      flash(`Opened ${added.length} file(s)`);
    },
    [flash],
  );

  const saveDoc = useCallback(
    (doc: NotepadDocument, useNative = false) => {
      const text = applyEol(doc.content, doc.eol);
      const ext = extensionForLanguage(doc.language);
      const name = doc.name.includes(".") ? doc.name : `${doc.name}.${ext}`;
      const blob = encodeText(text, doc.encoding);

      if (useNative && "showSaveFilePicker" in window) {
        void (async () => {
          try {
            // @ts-expect-error File System Access API
            const handle = await window.showSaveFilePicker({
              suggestedName: name,
              types: [{ description: "Text", accept: { "text/plain": [`.${ext}`, ".txt"] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            updateDoc(doc.id, { dirty: false, name: handle.name });
            flash(`Saved ${handle.name}`);
          } catch {
            /* cancelled */
          }
        })();
        return;
      }

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
      updateDoc(doc.id, { dirty: false });
      trackToolDownload(NOTEPAD_TOOL_SLUG, ext);
      flash(`Downloaded ${name}`);
    },
    [flash, updateDoc],
  );

  const saveAll = useCallback(() => {
    for (const doc of session.docs) {
      if (doc.dirty || doc.name.startsWith("new ")) saveDoc(doc);
    }
  }, [session.docs, saveDoc]);

  const openRecent = useCallback(
    (name: string) => {
      const recent = recentFiles.find((f) => f.name === name);
      if (!recent?.preview) {
        flash("Re-open from disk — preview not stored.");
        fileInputRef.current?.click();
        return;
      }
      const existing = session.docs.find((d) => d.name === name);
      if (existing) {
        setActive(existing.id);
        return;
      }
      const doc = createDocument({
        name,
        content: recent.preview,
        language: detectLanguageFromFilename(name),
        dirty: false,
      });
      setSession((s) => ({ ...s, docs: [...s.docs, doc], activeId: doc.id }));
    },
    [recentFiles, session.docs, setActive, flash],
  );

  const applyTransform = useCallback(
    (fn: (text: string) => string, wholeDoc = false) => {
      if (!activeDoc) return;
      const ed = activeEditor();
      if (!wholeDoc && ed) {
        const sel = getSelectionText(ed);
        if (sel) {
          replaceSelection(ed, fn(sel));
          recordMacro({ type: "replaceSelection", text: fn(sel) });
          return;
        }
      }
      updateDoc(activeDoc.id, { content: fn(activeDoc.content) });
    },
    [activeDoc, updateDoc, recordMacro],
  );

  const playMacro = useCallback(() => {
    const steps = macroSteps.length ? macroSteps : loadMacro();
    if (!steps.length || !activeDoc) {
      flash("No macro recorded.");
      return;
    }
    let content = activeDoc.content;
    for (const step of steps) {
      if (step.type === "insert") content += step.text;
      else if (step.type === "replaceSelection") content = step.text;
      else if (step.type === "runTransform") {
        if (step.transform === "upper") content = content.toUpperCase();
        if (step.transform === "lower") content = content.toLowerCase();
        if (step.transform === "trimTrailing") content = trimTrailingWhitespace(content);
      }
    }
    updateDoc(activeDoc.id, { content });
    flash(`Played macro (${steps.length} steps)`);
  }, [macroSteps, activeDoc, updateDoc, flash]);

  const stopMacro = useCallback(() => {
    setMacroRecording(false);
    saveMacro(macroSteps);
    flash(`Macro saved (${macroSteps.length} steps)`);
  }, [macroSteps, flash]);

  const compareWithTab = useCallback(
    (otherId: string) => {
      const other = session.docs.find((d) => d.id === otherId);
      if (!activeDoc || !other) return;
      const fragment = encodeSharedToolState(activeDoc.content, other.content);
      window.open(`/tools/text-diff${fragment}`, "_blank", "noopener,noreferrer");
    },
    [activeDoc, session.docs],
  );

  const shareActive = useCallback(() => {
    if (!activeDoc) return;
    const fragment = encodeSharedToolState(activeDoc.content);
    if (sharePayloadTooLong(fragment)) {
      flash("Document too large to share via URL.");
      return;
    }
    const url = `${window.location.origin}/notepad${fragment}`;
    void navigator.clipboard.writeText(url).then(() => {
      trackToolShareLink(NOTEPAD_TOOL_SLUG);
      flash("Share link copied");
    });
  }, [activeDoc, flash]);

  const toggleSplit = useCallback(
    (mode: NotepadSplitMode) => {
      if (mode === "none") {
        patchSession({ splitMode: "none", secondaryDocId: null });
        return;
      }
      const other = session.docs.find((d) => d.id !== activeDoc?.id);
      patchSession({
        splitMode: mode,
        secondaryDocId: other?.id ?? activeDoc?.id ?? null,
      });
    },
    [patchSession, session.docs, activeDoc],
  );

  const cloneToOtherView = useCallback(() => {
    if (!activeDoc) return;
    patchSession({
      splitMode: "vertical",
      secondaryDocId: activeDoc.id,
    });
  }, [activeDoc, patchSession]);

  const toggleBookmarkAtCursor = useCallback(() => {
    if (!activeDoc) return;
    const next = toggleBookmark(activeDoc.bookmarks, cursor.line);
    updateDoc(activeDoc.id, { bookmarks: next, dirty: true });
  }, [activeDoc, cursor.line, updateDoc]);

  const gotoBookmark = useCallback(
    (dir: "next" | "prev") => {
      if (!activeDoc) return;
      const line =
        dir === "next"
          ? nextBookmark(activeDoc.bookmarks, cursor.line)
          : prevBookmark(activeDoc.bookmarks, cursor.line);
      if (!line) return;
      const ed = activeEditor();
      ed?.revealLineInCenter(line);
      ed?.setPosition({ lineNumber: line, column: 1 });
      ed?.focus();
    },
    [activeDoc, cursor.line],
  );

  const runGoToLine = useCallback(() => {
    const n = parseInt(goToLine, 10);
    const ed = activeEditor();
    if (!ed || !Number.isFinite(n) || n < 1) return;
    ed.revealLineInCenter(n);
    ed.setPosition({ lineNumber: n, column: 1 });
    ed.focus();
    setGoToOpen(false);
    setGoToLine("");
  }, [goToLine]);

  const runPlugin = useCallback(
    (plugin: string) => {
      const ed = activeEditor();
      const sel = ed ? getSelectionText(ed) : activeDoc?.content ?? "";
      switch (plugin) {
        case "base64-encode": {
          const out = resultText(base64Encode(sel));
          if (ed && getSelectionText(ed)) replaceSelection(ed, out);
          else if (activeDoc) updateDoc(activeDoc.id, { content: out });
          break;
        }
        case "base64-decode": {
          const decoded = base64Decode(sel);
          const err = resultError(decoded);
          if (err) {
            flash(err);
            break;
          }
          const text = resultText(decoded);
          if (ed && getSelectionText(ed)) replaceSelection(ed, text);
          else if (activeDoc) updateDoc(activeDoc.id, { content: text });
          break;
        }
        case "hash-sha256": {
          void generateHash(sel, "SHA-256").then((h) => {
            const err = resultError(h);
            if (err) {
              flash(err);
              return;
            }
            const hex = resultText(h);
            if (ed && getSelectionText(ed)) replaceSelection(ed, hex);
            else if (activeDoc) updateDoc(activeDoc.id, { content: hex });
          });
          break;
        }
        case "json-format": {
          try {
            const parsed = JSON.parse(sel || activeDoc?.content || "{}");
            const pretty = JSON.stringify(parsed, null, 2);
            if (activeDoc) updateDoc(activeDoc.id, { content: pretty, language: "json" });
          } catch {
            flash("Invalid JSON");
          }
          break;
        }
        case "uuid": {
          const ids = generateUuids(1)[0];
          if (ed) replaceSelection(ed, ids);
          break;
        }
        default:
          break;
      }
    },
    [activeDoc, updateDoc, flash],
  );

  const mountEditor = useCallback(
    (which: "primary" | "secondary") => (ed: MonacoEditor.IStandaloneCodeEditor) => {
      if (which === "primary") primaryRef.current = ed;
      else secondaryRef.current = ed;
      ed.onDidFocusEditorWidget(() => {
        activeEditorRef.current = which;
      });
      ed.onDidChangeCursorSelection(() => {
        if (activeEditorRef.current !== which && session.splitMode !== "none") return;
        const pos = ed.getPosition();
        if (pos) setCursor({ line: pos.lineNumber, column: pos.column });
        const sel = ed.getSelection();
        const model = ed.getModel();
        if (sel && model) setSelectionLen(model.getValueInRange(sel).length);
      });
    },
    [session.splitMode],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeDoc) saveDoc(activeDoc, e.shiftKey);
      } else if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newDoc();
      } else if (mod && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setGoToOpen(true);
      } else if (mod && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activeDoc) closeDoc(activeDoc.id);
      } else if (e.key === "F11") {
        e.preventDefault();
        patchSession({ fullScreen: !session.fullScreen });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeDoc, saveDoc, newDoc, closeDoc, patchSession, session.fullScreen]);

  return {
    session,
    setSession,
    patchSession,
    activeDoc,
    secondaryDoc,
    cursor,
    selectionLen,
    message,
    flash,
    goToLine,
    setGoToLine,
    goToOpen,
    setGoToOpen,
    renameOpen,
    setRenameOpen,
    renameValue,
    setRenameValue,
    sessionSaveOpen,
    setSessionSaveOpen,
    sessionName,
    setSessionName,
    macroRecording,
    setMacroRecording,
    macroSteps,
    setMacroSteps,
    recentFiles,
    setRecentFiles,
    namedSessions,
    setNamedSessions,
    fileInputRef,
    primaryRef,
    secondaryRef,
    updateDoc,
    setActive,
    newDoc,
    closeDoc,
    closeOthers,
    closeAll,
    onOpenFiles,
    saveDoc,
    saveAll,
    openRecent,
    clearRecentFiles: () => {
      clearRecentFiles();
      setRecentFiles([]);
    },
    applyTransform,
    playMacro,
    stopMacro,
    recordMacro,
    compareWithTab,
    shareActive,
    toggleSplit,
    cloneToOtherView,
    toggleBookmarkAtCursor,
    gotoBookmark,
    runGoToLine,
    runPlugin,
    mountEditor,
    activeEditor,
    duplicateLine: () => duplicateLine(activeEditor()),
    deleteLine: () => deleteLine(activeEditor()),
    moveLineUp: () => moveLineUp(activeEditor()),
    moveLineDown: () => moveLineDown(activeEditor()),
    joinLines: () => joinLines(activeEditor()),
    transposeChars: () => transposeChars(activeEditor()),
    focusFind: () => runEditorAction(activeEditor(), "actions.find"),
    focusReplace: () => runEditorAction(activeEditor(), "editor.action.startFindReplaceAction"),
    selectAll: () => runEditorAction(activeEditor(), "editor.action.selectAll"),
    undo: () => runEditorAction(activeEditor(), "undo"),
    redo: () => runEditorAction(activeEditor(), "redo"),
    foldAll: () => runEditorAction(activeEditor(), "editor.foldAll"),
    unfoldAll: () => runEditorAction(activeEditor(), "editor.unfoldAll"),
    trimTrailing: () => applyTransform(trimTrailingWhitespace),
    trimLeading: () => applyTransform(trimLeadingWhitespace),
    removeEmpty: () => applyTransform(removeEmptyLines, true),
    sortLines: (numeric?: boolean) => applyTransform((t) => sortLines(t, numeric), true),
    reverseLines: () => applyTransform(reverseLines, true),
    indent: () => applyTransform((t) => indentLines(t, session.tabSize), true),
    unindent: () => applyTransform((t) => unindentLines(t, session.tabSize), true),
    toggleComment: () => activeDoc && applyTransform((t) => toggleLineComment(t, activeDoc.language), true),
    insertDateTime: (mode: "iso" | "local" | "date" | "time") => {
      const ed = activeEditor();
      const text = formatDateTime(mode);
      if (ed) replaceSelection(ed, text);
      else if (activeDoc) updateDoc(activeDoc.id, { content: activeDoc.content + text });
      recordMacro({ type: "insert", text });
    },
    saveNamedSession: (name: string) => {
      saveNamedSession(name, session);
      setNamedSessions(listNamedSessions());
      setSessionSaveOpen(false);
      flash(`Session "${name}" saved`);
    },
    loadNamedSession: (name: string) => {
      const loaded = loadNamedSession(name);
      if (loaded) setSession(loaded);
    },
    deleteNamedSession: (name: string) => {
      deleteNamedSession(name);
      setNamedSessions(listNamedSessions());
    },
    setSidePanel: (panel: NotepadSidePanel) =>
      patchSession({ showSidePanel: true, sidePanel: panel }),
    printActive: () => {
      if (!activeDoc) return;
      const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=600");
      if (!w) {
        flash("Allow pop-ups to print.");
        return;
      }
      const escaped = activeDoc.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      w.document.write(
        `<!DOCTYPE html><html><head><title>${activeDoc.name}</title><style>body{font:14px/1.5 ui-monospace,monospace;padding:24px;white-space:pre-wrap;}</style></head><body>${escaped}</body></html>`,
      );
      w.document.close();
      w.focus();
      w.print();
    },
    copyAll: () => {
      if (!activeDoc) return;
      void navigator.clipboard.writeText(activeDoc.content).then(() => {
        trackToolCopy(NOTEPAD_TOOL_SLUG, "output");
        flash("Copied to clipboard");
      });
    },
    resetSession: () => {
      if (!window.confirm("Clear session and reset all tabs?")) return;
      const fresh = defaultSession();
      setSession(fresh);
      saveNotepadSession(fresh);
      flash("Session reset");
    },
    labelForLanguage,
    encodingLabel,
    extensionForLanguage,
  };
}

export type NotepadController = ReturnType<typeof useNotepadController>;
