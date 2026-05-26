"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const RETENTION_FAQS = [
  {
    q: "Does DevBench store what I paste into tools?",
    a: "No. Standard tools process input in your browser tab only. We do not operate a database of tool inputs. Closing the tab or refreshing the page clears in-memory data unless you saved output yourself.",
  },
  {
    q: "How long do analytics providers keep visit data?",
    a: "Google Analytics and Vercel Analytics retention follows their respective policies (often 2–14 months for GA, shorter for Vercel aggregates). Those records describe pages and coarse device metadata — not tool payloads.",
  },
  {
    q: "Are PDF or image files kept on a server after conversion?",
    a: "No. PDF and image tools read files into memory in your browser, produce a download blob, and release references when you navigate away. We do not archive uploads.",
  },
  {
    q: "What about API Tester and Webhook Simulator?",
    a: "API Tester routes requests through a CORS proxy; bodies are forwarded to your target URL and not logged for long-term storage on DevBench. Webhook Simulator sends only what you configure to the destination you specify; signing secrets never leave your browser.",
  },
  {
    q: "Does localStorage retain sensitive data?",
    a: "Only non-sensitive preferences: theme (light/dark) and optional shortcut/recent tool lists (slugs only, not pasted content). Clear site data in your browser to remove them.",
  },
  {
    q: "How long do you keep contact form messages?",
    a: "Messages sent via your email client are retained only as long as needed to respond, then handled according to our mail provider’s normal retention.",
  },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function PrivacyRetentionFaq() {
  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
      {RETENTION_FAQS.map((faq) => (
        <FaqItem key={faq.q} q={faq.q} a={faq.a} />
      ))}
    </div>
  );
}
