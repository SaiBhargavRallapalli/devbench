import { getMonthGrid, isSundayColumn, type WeekStart } from "./month-grid";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export async function imageFileToDataUrl(file: File, maxSize = 1400, quality = 0.78): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing is unavailable.");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally { URL.revokeObjectURL(url); }
}

export function renderCalendarCanvas(options: { year: number; months: number[]; weekStart: WeekStart; title?: string }): HTMLCanvasElement {
  const { year, months, weekStart, title } = options;
  const fullYear = months.length > 1;
  const canvas = document.createElement("canvas");
  canvas.width = fullYear ? 3300 : 2200;
  canvas.height = fullYear ? 2400 : 2200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Calendar export is unavailable.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#111827";
  ctx.font = `600 ${fullYear ? 66 : 76}px sans-serif`;
  ctx.fillText(title?.trim() ? `${title.trim()} - ${year}` : String(year), canvas.width / 2, 100, canvas.width - 120);
  const cols = fullYear ? 3 : 1;
  const rows = fullYear ? 4 : 1;
  const cardW = (canvas.width - 100) / cols;
  const cardH = (canvas.height - 180) / rows;
  const labels = weekStart === 0 ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  months.forEach((month, index) => {
    const x = 50 + (index % cols) * cardW;
    const y = 150 + Math.floor(index / cols) * cardH;
    const cellW = (cardW - 50) / 7;
    const cellH = (cardH - 125) / 6;
    ctx.fillStyle = "#111827";
    ctx.font = `600 ${fullYear ? 38 : 64}px sans-serif`;
    ctx.fillText(MONTHS[month - 1], x + cardW / 2, y + 40);
    labels.forEach((label, col) => {
      ctx.fillStyle = isSundayColumn(col, weekStart) ? "#dc2626" : "#4b5563";
      ctx.font = `600 ${fullYear ? 27 : 42}px sans-serif`;
      ctx.fillText(label, x + 25 + (col + 0.5) * cellW, y + 93);
    });
    getMonthGrid(year, month, weekStart).weeks.forEach((week, row) => week.forEach((day, col) => {
      if (!day) return;
      ctx.fillStyle = isSundayColumn(col, weekStart) ? "#dc2626" : "#111827";
      ctx.font = `${fullYear ? 33 : 55}px sans-serif`;
      ctx.fillText(String(day), x + 25 + (col + 0.5) * cellW, y + 128 + (row + 0.5) * cellH);
    }));
  });
  return canvas;
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed.")), "image/png"));
}

export async function canvasToPdfBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const landscape = canvas.width > canvas.height;
  const page = doc.addPage(landscape ? [841.89, 595.28] : [595.28, 841.89]);
  const png = await doc.embedPng(await (await canvasToPngBlob(canvas)).arrayBuffer());
  const scale = Math.min((page.getWidth() - 32) / png.width, (page.getHeight() - 32) / png.height);
  const width = png.width * scale, height = png.height * scale;
  page.drawImage(png, { x: (page.getWidth() - width) / 2, y: (page.getHeight() - height) / 2, width, height });
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
