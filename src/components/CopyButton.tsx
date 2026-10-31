"use client";

import { useState, useCallback } from "react";
import { Clipboard, Check } from "lucide-react";
import { trackToolCopy } from "@/lib/analytics-events";
import { copyWithFeedback } from "@/lib/clipboard";

interface CopyButtonProps {
  text: string;
  className?: string;
  disabled?: boolean;
  /** Tool slug for analytics. Optional — when omitted, no event is fired. */
  toolSlug?: string;
  /** Optional label distinguishing this copy from others on the same tool. */
  copyLabel?: string;
}

export default function CopyButton({
  text,
  className = "",
  disabled = false,
  toolSlug,
  copyLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    // copyWithFeedback = shared execCommand fallback + failure toast.
    // Only show "Copied!" (and track the event) when the write actually
    // succeeded — the old fallback showed success even when execCommand
    // returned false.
    const ok = await copyWithFeedback(text);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (toolSlug) trackToolCopy(toolSlug, copyLabel);
  }, [text, toolSlug, copyLabel]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors ${
        copied
          ? "border-success/40 bg-success/10 text-success"
          : disabled || !text
            ? "cursor-not-allowed opacity-40"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Clipboard className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}
