import type { RefObject } from "react";

// ── Bracket-pair matching helpers ─────────────────────────────────────────

export function findMatchingBracket(text: string, cursorPos: number): { open: number; close: number } | null {
  const opens = "{[";
  const closes = "}]";
  // Precompute string context (which positions are inside a JSON string)
  const inStr = new Uint8Array(text.length);
  let inside = false, esc = false;
  for (let i = 0; i < text.length; i++) {
    inStr[i] = inside ? 1 : 0;
    const c = text[i];
    if (inside) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inside = false; }
    else if (c === '"') inside = true;
  }
  let checkPos = -1;
  for (const p of [cursorPos - 1, cursorPos, cursorPos + 1]) {
    if (p >= 0 && p < text.length && !inStr[p] && (opens.includes(text[p]) || closes.includes(text[p]))) {
      checkPos = p; break;
    }
  }
  if (checkPos === -1) return null;
  const ch = text[checkPos];
  const isOpen = opens.includes(ch);
  const matchChar = isOpen ? closes[opens.indexOf(ch)] : opens[closes.indexOf(ch)];
  const dir = isOpen ? 1 : -1;
  let depth = 1;
  for (let i = checkPos + dir; i >= 0 && i < text.length; i += dir) {
    if (inStr[i]) continue;
    const c = text[i];
    if (c === ch) depth++;
    else if (c === matchChar && --depth === 0) {
      return isOpen ? { open: checkPos, close: i } : { open: i, close: checkPos };
    }
  }
  return null;
}

export function charOffsetToLineCol(text: string, offset: number): { line: number; col: number } {
  const pos = Math.max(0, Math.min(offset, text.length));
  const before = text.slice(0, pos);
  const line = (before.match(/\n/g) ?? []).length + 1;
  const lastNl = before.lastIndexOf("\n");
  const col = lastNl === -1 ? pos + 1 : pos - lastNl;
  return { line, col };
}

type LineCol = { line: number; col: number };

function bracketColsForLine(
  lineNum: number,
  bracketOpen: LineCol | null,
  bracketClose: LineCol | null,
): number[] {
  const cols: number[] = [];
  if (bracketOpen && bracketOpen.line === lineNum) cols.push(bracketOpen.col);
  if (bracketClose && bracketClose.line === lineNum && bracketClose.col !== bracketOpen?.col) {
    cols.push(bracketClose.col);
  }
  return cols;
}

/** Underlay mirror: active line (full row) + 1ch bracket markers (no per-char layout drift). */
function JsonInputMirrorLine({
  line,
  lineNum,
  bracketOpen,
  bracketClose,
  isActive,
}: {
  line: string;
  lineNum: number;
  bracketOpen: LineCol | null;
  bracketClose: LineCol | null;
  isActive: boolean;
}) {
  const bracketCols = bracketColsForLine(lineNum, bracketOpen, bracketClose);
  const rowClass = `relative -mx-4 px-4${isActive ? " bg-muted/30" : ""}`;
  return (
    <div className={rowClass}>
      <span className="invisible whitespace-pre select-none">{line.length > 0 ? line : "\u00a0"}</span>
      {bracketCols.map((col) => (
        <span
          key={col}
          className="pointer-events-none absolute inset-y-0 w-[1ch] rounded-[2px] bg-teal-400/35 dark:bg-teal-400/25"
          style={{ left: `${col - 1}ch` }}
        />
      ))}
    </div>
  );
}

export function JsonInputMirrorOverlay({
  lines,
  overlayRef,
  bracketOpen,
  bracketClose,
  activeLine,
}: {
  lines: string[];
  overlayRef: RefObject<HTMLDivElement | null>;
  bracketOpen: LineCol | null;
  bracketClose: LineCol | null;
  activeLine: number | null;
}) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background" aria-hidden>
      <div
        ref={overlayRef}
        className="h-full w-full font-mono text-sm p-4 whitespace-pre leading-[1.625] [tab-size:2]"
        style={{ overflow: "scroll", scrollbarWidth: "none" } as React.CSSProperties}
      >
        {lines.map((line, idx) => (
          <JsonInputMirrorLine
            key={idx}
            line={line}
            lineNum={idx + 1}
            bracketOpen={bracketOpen}
            bracketClose={bracketClose}
            isActive={activeLine !== null && activeLine === idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
