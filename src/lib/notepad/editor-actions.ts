// Copyright (c) 2026 DevBench contributors. MIT License.
import type { editor as MonacoEditor } from "monaco-editor";

export function runEditorAction(
  ed: MonacoEditor.IStandaloneCodeEditor | null,
  actionId: string,
): void {
  ed?.getAction(actionId)?.run();
}

export function duplicateLine(ed: MonacoEditor.IStandaloneCodeEditor | null): void {
  runEditorAction(ed, "editor.action.copyLinesDownAction");
}

export function deleteLine(ed: MonacoEditor.IStandaloneCodeEditor | null): void {
  runEditorAction(ed, "editor.action.deleteLines");
}

export function moveLineUp(ed: MonacoEditor.IStandaloneCodeEditor | null): void {
  runEditorAction(ed, "editor.action.moveLinesUpAction");
}

export function moveLineDown(ed: MonacoEditor.IStandaloneCodeEditor | null): void {
  runEditorAction(ed, "editor.action.moveLinesDownAction");
}

export function joinLines(ed: MonacoEditor.IStandaloneCodeEditor | null): void {
  runEditorAction(ed, "editor.action.joinLines");
}

export function transposeChars(ed: MonacoEditor.IStandaloneCodeEditor | null): void {
  const model = ed?.getModel();
  const pos = ed?.getPosition();
  if (!ed || !model || !pos) return;
  const line = model.getLineContent(pos.lineNumber);
  if (pos.column >= line.length) return;
  const a = line[pos.column - 1];
  const b = line[pos.column];
  if (b === undefined) return;
  ed.executeEdits("transpose", [
    {
      range: {
        startLineNumber: pos.lineNumber,
        startColumn: pos.column,
        endLineNumber: pos.lineNumber,
        endColumn: pos.column + 1,
      },
      text: `${b}${a}`,
      forceMoveMarkers: true,
    },
  ]);
}

export function replaceSelection(
  ed: MonacoEditor.IStandaloneCodeEditor | null,
  text: string,
): void {
  const sel = ed?.getSelection();
  if (!ed || !sel) return;
  ed.executeEdits("replace", [{ range: sel, text, forceMoveMarkers: true }]);
}

export function getSelectionText(ed: MonacoEditor.IStandaloneCodeEditor | null): string {
  const model = ed?.getModel();
  const sel = ed?.getSelection();
  if (!model || !sel) return "";
  return model.getValueInRange(sel);
}

export function toggleBookmark(
  bookmarks: number[],
  line: number,
): number[] {
  return bookmarks.includes(line)
    ? bookmarks.filter((l) => l !== line)
    : [...bookmarks, line].sort((a, b) => a - b);
}

export function nextBookmark(bookmarks: number[], line: number): number | null {
  if (!bookmarks.length) return null;
  const next = bookmarks.find((l) => l > line);
  return next ?? bookmarks[0];
}

export function prevBookmark(bookmarks: number[], line: number): number | null {
  if (!bookmarks.length) return null;
  const prev = [...bookmarks].reverse().find((l) => l < line);
  return prev ?? bookmarks[bookmarks.length - 1];
}
