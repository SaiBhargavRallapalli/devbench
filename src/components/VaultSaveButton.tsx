"use client";

import { useState } from "react";
import { Archive, Check, Loader2 } from "lucide-react";
import { vaultSave } from "@/lib/devbench-vault";

export default function VaultSaveButton({
  toolSlug,
  getContent,
  getContent2,
  defaultTitle,
}: {
  toolSlug: string;
  getContent: () => string;
  getContent2?: () => string;
  defaultTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    const content = getContent();
    if (!content.trim()) return;
    setBusy(true);
    try {
      await vaultSave({
        title: title.trim() || `${toolSlug} draft`,
        toolSlug,
        content,
        content2: getContent2?.(),
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
      }, 1200);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setTitle(defaultTitle ?? `${toolSlug} — ${new Date().toLocaleDateString()}`);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Archive className="w-3.5 h-3.5" />
        Save to vault
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 shadow-sm">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-36 sm:w-48 text-xs bg-transparent border-none outline-none"
        placeholder="Draft title"
        onKeyDown={(e) => {
          if (e.key === "Enter") void save();
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : done ? <Check className="w-3 h-3" /> : null}
        {done ? "Saved" : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-muted-foreground px-1">
        Cancel
      </button>
    </div>
  );
}
