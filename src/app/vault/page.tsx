"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  Save,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import Header from "@/components/Header";
import {
  vaultList,
  vaultSave,
  vaultDelete,
  vaultExportBundle,
  vaultImportBundle,
  bundleToDownloadJson,
  parseBundleFile,
  type VaultEntry,
} from "@/lib/devbench-vault";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";

export default function VaultPage() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [title, setTitle] = useState("");
  const [toolSlug, setToolSlug] = useState("json-formatter");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await vaultList();
    setEntries(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setMessage("Title and content are required.");
      return;
    }
    await vaultSave({ title: title.trim(), toolSlug, content });
    setMessage("Saved to vault.");
    setTitle("");
    setContent("");
    await refresh();
  }

  async function handleExport() {
    const bundle = await vaultExportBundle();
    const blob = new Blob([bundleToDownloadJson(bundle)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devbench-vault-${new Date().toISOString().slice(0, 10)}.devbench.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleImport(mode: "merge" | "replace") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.devbench.json";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      try {
        const bundle = parseBundleFile(await f.text());
        const n = await vaultImportBundle(bundle, mode);
        setMessage(`Imported ${n} entries (${mode}).`);
        await refresh();
      } catch (e) {
        setMessage((e as Error).message);
      }
    };
    input.click();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Project vault</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drafts stored in IndexedDB on this device only — never uploaded to DevBench servers.
            Export a <code className="rounded bg-muted px-1">.devbench.json</code> bundle for backup.
          </p>
        </div>

        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Save draft</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={toolSlug}
            onChange={(e) => setToolSlug(e.target.value)}
            placeholder="Tool slug (e.g. json-formatter)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Paste content to save…"
            className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            <Save className="w-4 h-4" />
            Save to vault
          </button>
        </section>

        <section className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5" />
            Export bundle
          </button>
          <button
            type="button"
            onClick={() => void handleImport("merge")}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"
          >
            <Upload className="w-3.5 h-3.5" />
            Import (merge)
          </button>
          <button
            type="button"
            onClick={() => void handleImport("replace")}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Import (replace all)
          </button>
        </section>

        {message && <p className="text-xs text-muted-foreground">{message}</p>}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Saved entries</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No drafts yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {entries.map((e) => (
                <li key={e.id} className="flex items-start gap-3 p-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{e.toolSlug}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Updated {new Date(e.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={publicHrefForToolSlug(e.toolSlug)}
                    className="p-2 rounded-lg hover:bg-muted text-accent"
                    title="Open tool"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void vaultDelete(e.id).then(refresh);
                    }}
                    className="p-2 rounded-lg hover:bg-muted text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
