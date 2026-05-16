import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Changelog | DevBench",
  description: "What's new in DevBench — new tools, improvements, and fixes.",
};

type TagType = "new" | "improved" | "fixed";

interface ChangeItem {
  tag: TagType;
  text: string;
}

interface ChangeEntry {
  date: string;
  title: string;
  items: ChangeItem[];
}

interface MonthGroup {
  month: string;
  entries: ChangeEntry[];
}

const changelog: MonthGroup[] = [
  {
    month: "May 2026",
    entries: [
      {
        date: "May 14, 2026",
        title: "Network & Package Tools",
        items: [
          { tag: "new", text: "DNS Lookup tool — query A, AAAA, MX, TXT, CNAME, NS records via Cloudflare DoH" },
          { tag: "new", text: "IP Info tool — look up geolocation, ISP, timezone, ASN for any IP" },
          { tag: "new", text: "npm Package Compare — compare up to 3 npm packages side by side (downloads, size, deps, license)" },
          { tag: "new", text: "Gitignore Generator — multi-select templates for 20+ languages, frameworks, and editors" },
          { tag: "new", text: "License Generator — generate MIT, Apache 2.0, GPL 3.0, BSD, ISC, Unlicense, and MPL 2.0 licenses" },
          { tag: "new", text: ".env Validator — parse and validate .env files with duplicate detection, security warnings, and type checks" },
          { tag: "improved", text: "Tool pages now save your last input — navigate away and come back without losing work" },
          { tag: "improved", text: "Related tools section on every tool page — discover tools in the same category" },
        ],
      },
    ],
  },
  {
    month: "April 2026",
    entries: [
      {
        date: "April 22, 2026",
        title: "Diagrams, WebSocket & Notebook Tools",
        items: [
          { tag: "new", text: "Mermaid Editor — live diagram editor with export to PNG and SVG" },
          { tag: "new", text: "WebSocket Tester — connect to any WebSocket server and send/receive messages live" },
          { tag: "new", text: "Jupyter Notebook to PDF — convert .ipynb files to PDF for sharing" },
          { tag: "improved", text: "JSON Formatter now shows syntax errors with line and column numbers" },
          { tag: "improved", text: "PDF tools load faster — lazy-loaded PDF.js bundle" },
          { tag: "fixed", text: "Base64 Image decoder not handling data URLs with whitespace" },
        ],
      },
    ],
  },
  {
    month: "March 2026",
    entries: [
      {
        date: "March 18, 2026",
        title: "SVG, EXIF & Unicode Tools",
        items: [
          { tag: "new", text: "SVG Optimizer — remove bloat from SVG files using SVGO rules" },
          { tag: "new", text: "EXIF Viewer — inspect photo metadata (camera, GPS, timestamp) without uploading" },
          { tag: "new", text: "Unicode Checker — inspect any character's codepoint, category, and name" },
          { tag: "improved", text: "Regex Tester — added substitution mode and improved match highlighting" },
          { tag: "improved", text: "Command palette (Ctrl+K) is now faster and remembers recent picks" },
          { tag: "fixed", text: "CSS Box Shadow tool overflowing on mobile screens" },
        ],
      },
    ],
  },
  {
    month: "February 2026",
    entries: [
      {
        date: "February 11, 2026",
        title: "Image Conversion & HTTP Reference",
        items: [
          { tag: "new", text: "Image Format Converter — convert JPG, PNG, WebP, AVIF client-side" },
          { tag: "new", text: "HTTP Status Reference — searchable table of all HTTP status codes with descriptions" },
          { tag: "improved", text: "Markdown Preview — added support for GitHub-Flavored Markdown tables and task lists" },
          { tag: "improved", text: "Timezone Converter — shows DST status and UTC offset for each timezone" },
          { tag: "fixed", text: "QR Code generator not rendering on some mobile browsers" },
        ],
      },
    ],
  },
  {
    month: "January 2026",
    entries: [
      {
        date: "January 8, 2026",
        title: "Finance Tools & UX Improvements",
        items: [
          { tag: "new", text: "Gradient Generator — visual CSS gradient builder with code output" },
          { tag: "new", text: "Loan EMI Calculator — principal, rate, and tenure inputs with amortization table" },
          { tag: "new", text: "Compound Interest Calculator — with monthly/quarterly/annual compounding options" },
          { tag: "improved", text: "Homepage search now searches tool descriptions, not just names" },
          { tag: "improved", text: "Favourites (⭐) persist across sessions — star any tool from the homepage grid" },
          { tag: "fixed", text: "JSON Diff tool not handling top-level arrays correctly" },
        ],
      },
    ],
  },
  {
    month: "December 2025",
    entries: [
      {
        date: "December 10, 2025",
        title: "Image Processing Suite",
        items: [
          { tag: "new", text: "Background Remover — remove image backgrounds client-side using AI (no server upload)" },
          { tag: "new", text: "Image Compressor — compress JPG/PNG/WebP with quality slider" },
          { tag: "new", text: "Image Resizer — resize images to exact pixels or percentage" },
          { tag: "improved", text: "PDF tools now support files up to 200 MB" },
          { tag: "improved", text: '"Recently used" section on homepage shows last 8 tools' },
        ],
      },
    ],
  },
  {
    month: "November 2025",
    entries: [
      {
        date: "November 1, 2025",
        title: "Initial Launch",
        items: [
          { tag: "new", text: "Initial launch with 100+ tools across JSON, Encoding, Text, Dev, Image, PDF, Conversion, Finance, Health, Math, and Date & Time categories" },
          { tag: "new", text: "Privacy-first: all processing runs in your browser — no uploads, no accounts" },
          { tag: "new", text: "Offline-ready: most tools work without an internet connection after first load" },
        ],
      },
    ],
  },
];

const tagClass: Record<TagType, string> = {
  new: "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  improved: "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400",
  fixed: "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          All tools
        </Link>
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground mb-12">New tools, improvements, and fixes to DevBench.</p>
        {changelog.map((group) => (
          <div key={group.month} className="mb-12">
            <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6 flex items-center gap-3">
              {group.month}
              <div className="flex-1 h-px bg-border" />
            </div>
            {group.entries.map((entry) => (
              <div key={entry.date} className="mb-8 border-l-2 border-border pl-6 relative">
                <p className="text-xs text-muted-foreground mb-1">{entry.date}</p>
                <p className="font-semibold mb-2">{entry.title}</p>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-none">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={tagClass[item.tag]}>{item.tag}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
}
