import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { notebookToHtml, type Notebook } from "@/lib/notebook-to-html";

const execAsync = promisify(exec);

const MAX_FILE_BYTES = 50 * 1024 * 1024;

async function getBrowser() {
  // On Vercel / serverless: use the bundled compressed Chromium.
  // On a Linux server with a system Chromium: set CHROMIUM_PATH env var.
  // Falls back to sparticuz in all other cases.
  if (process.env.CHROMIUM_PATH) {
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }

  const chromium = await import("@sparticuz/chromium");
  const puppeteer = await import("puppeteer-core");
  return puppeteer.default.launch({
    headless: true,
    executablePath: await chromium.default.executablePath(),
    args: chromium.default.args,
  });
}

export async function POST(req: NextRequest) {
  const id = randomBytes(8).toString("hex");
  const base = join(tmpdir(), `nb-${id}`);
  const ipynbPath = `${base}.ipynb`;
  const htmlPath = `${base}.html`;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const scaleRaw = form.get("scale");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".ipynb")) {
      return NextResponse.json({ error: "Only .ipynb files are accepted." }, { status: 400 });
    }

    const scale = Math.min(1.0, Math.max(0.5, parseFloat(String(scaleRaw ?? "0.75")) || 0.75));
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File exceeds the 50 MB limit." }, { status: 413 });
    }

    const ipynbBuffer = Buffer.from(bytes);
    await writeFile(ipynbPath, ipynbBuffer);

    // Step 1: ipynb → HTML
    // Try jupyter nbconvert first (better fidelity: MathJax, syntax highlighting).
    // Fall back to the JS renderer when jupyter is not available (Vercel, etc.).
    let html: string;
    const jupyterAvailable = await execAsync(
      `jupyter nbconvert --to html --output "${htmlPath}" "${ipynbPath}"`,
      { timeout: 120_000 }
    )
      .then(() => true)
      .catch(() => false);

    if (jupyterAvailable) {
      html = await readFile(htmlPath, "utf-8");
    } else {
      const nb = JSON.parse(ipynbBuffer.toString("utf-8")) as Notebook;
      const title = file.name.replace(/\.ipynb$/i, "");
      html = notebookToHtml(nb, title, { includeCodeCells: true, includeOutputs: true });
    }

    // Step 2: HTML → PDF via Puppeteer
    const browser = await getBrowser();
    let pdfBytes: Uint8Array;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
      pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        scale,
        margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      });
    } finally {
      await browser.close();
    }

    const outName = file.name.replace(/\.ipynb$/i, ".pdf");
    return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Conversion failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await Promise.allSettled([unlink(ipynbPath), unlink(htmlPath)]);
  }
}
