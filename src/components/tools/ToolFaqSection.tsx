"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TOOL_FAQS } from "@/lib/tool-faqs";

export default function ToolFaqSection({ slug }: { slug: string }) {
  const faqs = TOOL_FAQS[slug];
  if (!faqs?.length) return null;

  return (
    <aside id="tool-faq" className="max-w-6xl mx-auto px-4 pb-10 w-full scroll-mt-24">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
        {faqs.map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </div>
    </aside>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card">
      <button
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
        <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}
