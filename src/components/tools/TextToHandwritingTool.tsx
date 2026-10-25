"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { downloadBlob } from "@/lib/pdf-download";
import { friendlyError } from "@/lib/friendly-error";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import { IMAGE_WORKER_MAX_PIXELS } from "@/lib/image-worker-limits";
import {
  HANDWRITING_FONTS,
  INK_COLORS,
  PAPER_STYLES,
  paginateLines,
  ruleLayout,
  wrapTextToLines,
  type PaperStyle,
} from "@/lib/handwriting";

const PAGE_W = 794; // A4 at 96 DPI
const PAGE_H = 1123;
/** Render at 2× for a crisp ~192 DPI PNG. */
const BASE_RENDER_SCALE = 2;
/** Hard ceiling for a single exported page (kept below the 50MP worker cap). */
const MAX_PAGE_SIDE = 8000;

function clampRenderScale(scale: number): number {
  const bySide = MAX_PAGE_SIDE / Math.max(PAGE_W, PAGE_H);
  const byArea = Math.sqrt(IMAGE_WORKER_MAX_PIXELS / (PAGE_W * PAGE_H));
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(scale, bySide, byArea);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

interface PageRenderOpts {
  ctx: CanvasRenderingContext2D;
  scale: number;
  paper: PaperStyle;
  lineSpacing: number;
  fontStack: string;
  fontSize: number;
  ink: string;
  title: string;
  date: string;
  isFirstPage: boolean;
  margin: number;
  ruleYs: Array<{ y: number }>;
  lines: string[];
}

function renderPage(o: PageRenderOpts): void {
  const { ctx, scale, paper, lineSpacing, fontStack, fontSize, ink } = o;
  const { title, date, isFirstPage, margin, ruleYs, lines } = o;

  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, PAGE_W, PAGE_H);

  // Paper — always white so the PNG reads like a real sheet in any theme.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  const x1 = margin * 0.5;
  const x2 = PAGE_W - margin * 0.5;
  if (paper.kind !== "none") {
    ctx.strokeStyle = paper.lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const rule of ruleYs) {
      ctx.moveTo(x1, rule.y + 0.5);
      ctx.lineTo(x2, rule.y + 0.5);
    }
    if (paper.kind === "grid") {
      const y1 = margin * 0.5;
      const y2 = PAGE_H - margin * 0.5;
      for (let x = x1; x <= x2; x += lineSpacing) {
        const px = Math.round(x) + 0.5;
        ctx.moveTo(px, y1);
        ctx.lineTo(px, y2);
      }
    }
    ctx.stroke();
  }

  const headerY = Math.max(16, margin * 0.5);
  ctx.fillStyle = ink;
  ctx.font = `${Math.min(fontSize + 4, 40)}px ${fontStack}`;
  ctx.textBaseline = "middle";
  if (isFirstPage && title.trim()) {
    ctx.textAlign = "center";
    ctx.fillText(title.trim(), PAGE_W / 2, headerY);
  }
  if (isFirstPage && date.trim()) {
    ctx.textAlign = "right";
    ctx.fillText(date.trim(), x2, headerY);
  }

  // Body text sits with its baseline on each rule.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `${fontSize}px ${fontStack}`;
  const count = Math.min(lines.length, ruleYs.length);
  for (let i = 0; i < count; i++) {
    const line = lines[i];
    if (line) ctx.fillText(line, margin, ruleYs[i].y);
  }
  ctx.restore();
}

export default function TextToHandwritingTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState(
    "Paste or type your notes, letter, or assignment here. Each line wraps to the page rules and long text flows onto extra pages.",
  );
  const [fontId, setFontId] = useState(HANDWRITING_FONTS[0].id);
  const [inkId, setInkId] = useState(INK_COLORS[0].id);
  const [paperId, setPaperId] = useState(PAPER_STYLES[0].id);
  const [lineSpacing, setLineSpacing] = useState(PAPER_STYLES[0].lineSpacingPx);
  const [fontSize, setFontSize] = useState(20);
  const [margin, setMargin] = useState(64);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const font = HANDWRITING_FONTS.find((f) => f.id === fontId) ?? HANDWRITING_FONTS[0];
  const paper = PAPER_STYLES.find((p) => p.id === paperId) ?? PAPER_STYLES[0];
  const ink = INK_COLORS.find((c) => c.id === inkId) ?? INK_COLORS[0];

  const layout = useMemo(
    () =>
      ruleLayout({
        pageWidthPx: PAGE_W,
        pageHeightPx: PAGE_H,
        lineSpacingPx: lineSpacing,
        marginTopPx: margin,
        marginBottomPx: margin,
        marginLeftPx: margin,
        fontSizePx: fontSize,
      }),
    [lineSpacing, margin, fontSize],
  );

  const allLines = useMemo(
    () => wrapTextToLines(text, layout.charsPerLine),
    [text, layout.charsPerLine],
  );

  const pages = useMemo(
    () =>
      allLines.length > 0 && layout.lines.length > 0
        ? paginateLines(allLines, layout.lines.length)
        : [[]],
    [allLines, layout.lines.length],
  );

  const current = Math.min(Math.max(page, 0), Math.max(0, pages.length - 1));
  const pageLines = useMemo(() => pages[current] ?? [], [pages, current]);
  const isFirstPage = current === 0;

  // Note: the date field is intentionally not auto-prefilled — computing "today"
  // during render would hydration-mismatch against the server-rendered HTML.

  // Live preview render.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");
      renderPage({
        ctx,
        scale: clampRenderScale(BASE_RENDER_SCALE),
        paper,
        lineSpacing,
        fontStack: font.stack,
        fontSize,
        ink: ink.value,
        title,
        date,
        isFirstPage,
        margin,
        ruleYs: layout.lines,
        lines: pageLines,
      });
    } catch (e) {
      setError(friendlyError(e, "Couldn't render the handwriting preview. Please try again."));
      trackToolError(
        "text-to-handwriting",
        "render",
        e instanceof Error ? e.message : String(e),
      );
    }
  }, [
    paper,
    lineSpacing,
    font.stack,
    fontSize,
    ink.value,
    title,
    date,
    isFirstPage,
    margin,
    layout.lines,
    pageLines,
  ]);

  const visibleChars =
    text.length + (isFirstPage ? title.length + date.length : 0);

  const download = useCallback(() => {
    setError("");
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setError(friendlyError(new Error("PNG export failed"), "Couldn't create the PNG. Please try again."));
          trackToolError("text-to-handwriting", "download_png", "toBlob returned null");
          return;
        }
        const name = slugify(title) || "text";
        downloadBlob(blob, `${name}-handwriting.png`, "text-to-handwriting");
        trackToolSuccess("text-to-handwriting", "download_png", {
          pages: pages.length,
          page: current + 1,
          paper: paper.id,
        });
      }, "image/png");
    } catch (e) {
      setError(friendlyError(e, "Couldn't create the PNG. Please try again."));
      trackToolError(
        "text-to-handwriting",
        "download_png",
        e instanceof Error ? e.message : String(e),
      );
    }
  }, [title, pages.length, current, paper.id]);

  const selectPaper = (id: string) => {
    setPaperId(id);
    const preset = PAPER_STYLES.find((p) => p.id === id);
    if (preset) setLineSpacing(preset.lineSpacingPx);
  };

  const labelCls = "block text-sm font-medium mb-1.5";
  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── controls ── */}
        <section className="animate-slide-up space-y-5 rounded-2xl border border-border bg-card p-6">
          <div>
            <label htmlFor="tth-text" className={labelCls}>
              Text to convert
            </label>
            <textarea
              id="tth-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPage(0);
              }}
              rows={7}
              placeholder="The quick brown fox jumps over the lazy dog — paste your notes or letter here…"
              className={`${inputCls} min-h-[180px] resize-y`}
            />
          </div>

          <div>
            <label htmlFor="tth-font" className={labelCls}>
              Handwriting style
            </label>
            <select
              id="tth-font"
              value={fontId}
              onChange={(e) => setFontId(e.target.value)}
              className={inputCls}
            >
              {HANDWRITING_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Uses fonts installed on your device; falls back to cursive.
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-medium mb-1.5">Ink color</legend>
            <div className="flex flex-wrap gap-3">
              {INK_COLORS.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="tth-ink"
                    value={c.id}
                    checked={inkId === c.id}
                    onChange={() => setInkId(c.id)}
                    className="accent-accent"
                  />
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: c.value }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tth-paper" className={labelCls}>
                Paper
              </label>
              <select
                id="tth-paper"
                value={paperId}
                onChange={(e) => selectPaper(e.target.value)}
                className={inputCls}
              >
                {PAPER_STYLES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tth-margin" className={labelCls}>
                Page margin (px)
              </label>
              <input
                id="tth-margin"
                type="number"
                min={40}
                max={120}
                step={4}
                value={margin}
                onChange={(e) =>
                  setMargin(Math.min(120, Math.max(40, Number(e.target.value) || 40)))
                }
                className={inputCls}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Space kept around the text block.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="tth-spacing" className="text-sm font-medium">
                Line spacing
              </label>
              <output htmlFor="tth-spacing" className="font-mono text-xs text-muted-foreground">
                {lineSpacing}px
              </output>
            </div>
            <input
              id="tth-spacing"
              type="range"
              min={18}
              max={40}
              step={1}
              value={lineSpacing}
              onChange={(e) => setLineSpacing(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="tth-size" className="text-sm font-medium">
                Font size
              </label>
              <output htmlFor="tth-size" className="font-mono text-xs text-muted-foreground">
                {fontSize}px
              </output>
            </div>
            <input
              id="tth-size"
              type="range"
              min={14}
              max={28}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tth-title" className={labelCls}>
                Title (optional)
              </label>
              <input
                id="tth-title"
                type="text"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics notes"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="tth-date" className={labelCls}>
                Date (optional)
              </label>
              <input
                id="tth-date"
                type="text"
                value={date}
                maxLength={40}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. October 25, 2026"
                className={inputCls}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Runs 100% in your browser — your text never leaves your device.
          </p>

          <button
            type="button"
            onClick={download}
            disabled={!text.trim()}
            aria-label={
              pages.length > 1
                ? `Download page ${current + 1} as PNG`
                : "Download handwriting as PNG"
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            {pages.length > 1 ? "Download this page" : "Download PNG"}
          </button>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </section>

        {/* ── preview ── */}
        <section className="animate-slide-up space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Live preview</h2>
            <span className="text-xs text-muted-foreground">
              Page {current + 1} of {pages.length}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={PAGE_W * BASE_RENDER_SCALE}
            height={PAGE_H * BASE_RENDER_SCALE}
            role="img"
            aria-label={`Handwriting preview of ${visibleChars} characters`}
            className="block w-full h-auto rounded-xl border border-border shadow-sm"
          />

          {pages.length > 1 && (
            <div
              className="flex items-center justify-between gap-3"
              role="group"
              aria-label="Page navigation"
            >
              <button
                type="button"
                aria-label="Previous page"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted/40 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span aria-live="polite" className="text-xs text-muted-foreground">
                Page {current + 1} of {pages.length}
              </span>
              <button
                type="button"
                aria-label="Next page"
                disabled={current >= pages.length - 1}
                onClick={() => setPage(current + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted/40 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {layout.charsPerLine} characters per line · {layout.lines.length} lines per page ·{" "}
            {allLines.length} lines total
          </p>
        </section>
      </div>
    </main>
  );
}
