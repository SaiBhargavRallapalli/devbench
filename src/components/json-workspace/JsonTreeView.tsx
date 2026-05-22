"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  CopyPlus,
  Pencil,
  Scissors,
  ArrowDownAZ,
  PlusCircle,
  Trash2,
  ClipboardPaste as ClipboardPasteIcon,
} from "lucide-react";
import type { ContextMenuState } from "@/lib/json-workspace/types";

const MAX_TREE_NODES = 10000;

function nodeMatchesSearch(key: string, val: unknown, term: string): boolean {
  const t = term.toLowerCase();
  if (key.toLowerCase().includes(t)) return true;
  if (typeof val === "string" && val.toLowerCase().includes(t)) return true;
  if ((typeof val === "number" || typeof val === "boolean") && String(val).includes(t)) return true;
  return false;
}

function subtreeMatchesSearch(val: unknown, key: string, term: string): boolean {
  if (!term) return true;
  if (nodeMatchesSearch(key, val, term)) return true;
  if (Array.isArray(val)) return val.some((item, i) => subtreeMatchesSearch(item, String(i), term));
  if (val !== null && typeof val === "object")
    return Object.entries(val as Record<string, unknown>).some(([k, v]) => subtreeMatchesSearch(v, k, term));
  return false;
}

function highlightMatch(text: string, term: string): React.ReactNode {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-warning/40 text-foreground not-italic rounded-sm px-px">{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  );
}

export function countTreeMatches(val: unknown, key: string, term: string): number {
  if (!term) return 0;
  let n = nodeMatchesSearch(key, val, term) ? 1 : 0;
  if (Array.isArray(val)) val.forEach((item, i) => { n += countTreeMatches(item, String(i), term); });
  else if (val !== null && typeof val === "object")
    Object.entries(val as Record<string, unknown>).forEach(([k, v]) => { n += countTreeMatches(v, k, term); });
  return n;
}

export function InteractiveTreeNode({
  nodeKey,
  value,
  depth,
  defaultExpanded = false,
  nodeCount,
  path,
  onUpdate,
  expandAllSignal,
  collapseAllSignal,
  onContextMenu,
  onSelect,
  searchTerm = "",
}: {
  nodeKey: string;
  value: unknown;
  depth: number;
  defaultExpanded?: boolean;
  nodeCount: { current: number };
  path: (string | number)[];
  onUpdate: (path: (string | number)[], newValue: unknown) => void;
  expandAllSignal: number;
  collapseAllSignal: number;
  onContextMenu: (e: React.MouseEvent, ctx: ContextMenuState) => void;
  onSelect?: (path: (string | number)[]) => void;
  searchTerm?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (expandAllSignal > 0) setExpanded(true);
  }, [expandAllSignal]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (collapseAllSignal > 0) setExpanded(false);
  }, [collapseAllSignal]);

  // Must be declared before any early returns to satisfy Rules of Hooks.
  const [nodeCopied, setNodeCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  // Search match state — computed before early return to keep hook order stable.
  const hasMatch = !searchTerm || subtreeMatchesSearch(value, nodeKey, searchTerm);
  const directMatch = Boolean(searchTerm) && nodeMatchesSearch(nodeKey, value, searchTerm);

  useEffect(() => {
    // Auto-expand when a descendant matches the search term.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (searchTerm && hasMatch) setExpanded(true);
  }, [searchTerm, hasMatch]);

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    const raw = value === null ? "null" : typeof value === "string" ? value : String(value);
    setEditValue(raw);
    setEditing(true);
  }

  function commitEdit() {
    setEditing(false);
    if (editValue.trim() === "") return; // blank → cancel, restore original
    let parsed: unknown = editValue;
    if (editValue === "null") parsed = null;
    else if (editValue === "true") parsed = true;
    else if (editValue === "false") parsed = false;
    else if (!isNaN(Number(editValue))) parsed = Number(editValue);
    onUpdate(path, parsed);
  }

  if (nodeCount.current > MAX_TREE_NODES) {
    return depth === 0 ? (
      <div className="px-3 py-1 text-muted-foreground italic text-sm">
        Tree truncated at {MAX_TREE_NODES.toLocaleString()} nodes...
      </div>
    ) : null;
  }
  // eslint-disable-next-line react-hooks/immutability
  nodeCount.current++;

  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const typeLabel = isArray
    ? `array[${value.length}]`
    : isObject
      ? `object{${Object.keys(value).length}}`
      : value === null
        ? "null"
        : typeof value;

  const typeColor = (() => {
    if (typeof value === "string") return "text-success";
    if (typeof value === "number") return "text-blue-500";
    if (typeof value === "boolean") return "text-warning";
    if (value === null) return "text-muted-foreground";
    return "text-foreground";
  })();

  const previewRaw = (() => {
    if (typeof value === "string") return `"${value.length > 60 ? value.slice(0, 60) + "..." : value}"`;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === null) return "null";
    return "";
  })();

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parentPath = path.slice(0, -1);
    const parentVal = parentPath.length > 0 ? undefined : undefined;
    void parentVal;
    onContextMenu(e, {
      x: e.clientX,
      y: e.clientY,
      path,
      value,
      parentIsArray: false,
    });
  };
  function copyNodePath(e: React.MouseEvent) {
    e.stopPropagation();
    const jsonpath = path.length === 0 ? "$" : "$" + path.map((p) =>
      typeof p === "number" ? `[${p}]` : /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(String(p)) ? `.${p}` : `["${p}"]`
    ).join("");
    navigator.clipboard.writeText(jsonpath).then(() => {
      setNodeCopied(true);
      setTimeout(() => setNodeCopied(false), 1500);
    }).catch(() => {});
  }

  return (
    <div className={searchTerm && !hasMatch ? "opacity-20 pointer-events-none" : undefined}>
      <div
        className={`flex items-center gap-1 py-0.5 px-2 rounded cursor-pointer select-none group transition-colors ${
          directMatch ? "bg-warning/10 hover:bg-warning/15" : "hover:bg-accent/5"
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => { if (isExpandable) setExpanded(!expanded); onSelect?.(path); }}
        onContextMenu={handleRightClick}
      >
        {isExpandable ? (
          <span className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="font-mono text-sm text-accent font-medium">
          {highlightMatch(nodeKey, searchTerm)}
        </span>
        <span className="text-muted-foreground text-xs ml-1">{typeLabel}</span>
        {!isExpandable && editing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
              if (e.key === "Escape") { e.stopPropagation(); setEditing(false); }
              e.stopPropagation();
            }}
            onBlur={commitEdit}
            onClick={(e) => e.stopPropagation()}
            className={`flex-1 font-mono text-sm bg-card border border-accent/50 rounded px-1.5 outline-none min-w-0 ${typeColor}`}
          />
        ) : previewRaw ? (
          <span
            className={`font-mono text-sm ml-2 truncate flex-1 ${typeColor} ${!isExpandable ? "group-hover:underline-offset-2" : ""}`}
            title={typeof value === "string" ? value : undefined}
            onDoubleClick={!isExpandable ? startEdit : undefined}
          >
            {highlightMatch(previewRaw, searchTerm)}
          </span>
        ) : !isExpandable ? (
          <span className="flex-1" />
        ) : null}
        {!editing && (
          <button
            onClick={copyNodePath}
            aria-label="Copy JSONPath"
            title="Copy JSONPath"
            className={`ml-auto shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
              nodeCopied
                ? "border-success/40 bg-success/10 text-success"
                : "border-transparent text-muted-foreground/40 group-hover:border-border group-hover:bg-card group-hover:text-muted-foreground hover:!text-accent hover:!border-accent/40"
            }`}
          >
            {nodeCopied ? "✓ copied" : "⎘ path"}
          </button>
        )}
        {!isExpandable && !editing && (
          <button
            onClick={startEdit}
            aria-label="Edit value"
            title="Edit value (or double-click)"
            className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-accent transition-all"
          >
            <Pencil size={11} />
          </button>
        )}
      </div>
      {expanded && isExpandable && (
        <div>
          {isArray
            ? value.map((item, idx) => (
                <InteractiveTreeNode
                  key={idx}
                  nodeKey={String(idx)}
                  value={item}
                  depth={depth + 1}
                  nodeCount={nodeCount}
                  path={[...path, idx]}
                  onUpdate={onUpdate}
                  expandAllSignal={expandAllSignal}
                  collapseAllSignal={collapseAllSignal}
                  onContextMenu={onContextMenu}
                  onSelect={onSelect}
                  searchTerm={searchTerm}
                />
              ))
            : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <InteractiveTreeNode
                  key={k}
                  nodeKey={k}
                  value={v}
                  depth={depth + 1}
                  nodeCount={nodeCount}
                  path={[...path, k]}
                  onUpdate={onUpdate}
                  expandAllSignal={expandAllSignal}
                  collapseAllSignal={collapseAllSignal}
                  onContextMenu={onContextMenu}
                  onSelect={onSelect}
                  searchTerm={searchTerm}
                />
              ))}
        </div>
      )}
    </div>
  );
}

// ── Mini tree for transform preview ──────────────────────────────────────

export function MiniTreeNode({
  nodeKey,
  value,
  depth,
  defaultExpanded = false,
}: {
  nodeKey: string;
  value: unknown;
  depth: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const typeColor = (() => {
    if (typeof value === "string") return "text-success";
    if (typeof value === "number") return "text-blue-500";
    if (typeof value === "boolean") return "text-warning";
    if (value === null) return "text-muted-foreground";
    return "text-foreground";
  })();

  const preview = (() => {
    if (typeof value === "string") return `"${value.length > 40 ? value.slice(0, 40) + "..." : value}"`;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === null) return "null";
    if (isArray) return `[${value.length}]`;
    if (isObject) return `{${Object.keys(value).length}}`;
    return "";
  })();

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 px-1 hover:bg-muted/40 rounded cursor-pointer select-none text-xs font-mono"
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
        onClick={() => isExpandable && setExpanded(!expanded)}
      >
        {isExpandable ? (
          <span className="w-3 h-3 flex items-center justify-center text-muted-foreground shrink-0">
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="text-accent">{nodeKey}:</span>
        <span className={`ml-1 truncate ${typeColor}`}>{preview}</span>
      </div>
      {expanded && isExpandable && (
        <div>
          {isArray
            ? value.map((item, idx) => (
                <MiniTreeNode key={idx} nodeKey={String(idx)} value={item} depth={depth + 1} />
              ))
            : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <MiniTreeNode key={k} nodeKey={k} value={v} depth={depth + 1} />
              ))}
        </div>
      )}
    </div>
  );
}

// ── Context Menu ─────────────────────────────────────────────────────────

export function TreeContextMenu({
  ctx,
  onClose,
  onAction,
}: {
  ctx: ContextMenuState;
  onClose: () => void;
  onAction: (action: string, ctx: ContextMenuState) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items: { label: string; action: string; icon: React.ReactNode; separator?: boolean }[] = [
    { label: "Edit Value", action: "editValue", icon: <Pencil size={13} /> },
    { label: "Edit Key", action: "editKey", icon: <Pencil size={13} /> },
    { label: "Copy Value", action: "copy", icon: <ClipboardCopy size={13} /> },
    { label: "Copy JSONPath", action: "copyPath", icon: <ClipboardCopy size={13} />, separator: true },
    { label: "Paste as Child", action: "paste", icon: <ClipboardPasteIcon size={13} /> },
    { label: "Duplicate", action: "duplicate", icon: <CopyPlus size={13} /> },
    { label: "Extract", action: "extract", icon: <Scissors size={13} />, separator: true },
    { label: "Sort Children", action: "sort", icon: <ArrowDownAZ size={13} /> },
    { label: "Insert Object {}", action: "insertObject", icon: <PlusCircle size={13} />, separator: true },
    { label: "Insert Array []", action: "insertArray", icon: <PlusCircle size={13} /> },
    { label: "Insert Value", action: "insertValue", icon: <PlusCircle size={13} /> },
    { label: "Remove", action: "remove", icon: <Trash2 size={13} />, separator: true },
  ];

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    left: ctx.x,
    top: ctx.y,
    zIndex: 45,
  };

  return (
    <div ref={menuRef} style={menuStyle} className="bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px] animate-fade-in">
      {items.map((item, i) => (
        <div key={i}>
          {item.separator && i > 0 && <div className="h-px bg-border my-1" />}
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-muted/60 text-foreground transition-colors"
            onClick={() => {
              onAction(item.action, ctx);
              onClose();
            }}
          >
            <span className="text-muted-foreground">{item.icon}</span>
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}
