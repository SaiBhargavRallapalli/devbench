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
    const list = await vaultList();
    setEntries(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    vaultList().then((list) => {
      if (!mounted) return;
      setEntries(list);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

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
                    href={`${publicHrefForToolSlug(e.toolSlug)}?vault=${e.id}`}
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

        <section className="space-y-4 border-t border-border pt-8 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            What the project vault is — and where your drafts live
          </h2>
          <p>
            The vault is DevBench&apos;s local-first scratch space. Use it to keep the inputs
            and outputs you reuse — a JSON payload you test against every day, a regex you
            refine over a week, a pipeline input you do not want to rebuild from scratch. Each
            entry stores a title, the tool it belongs to, and the draft text itself, and the
            external-link button on every saved row reopens that tool with the draft loaded
            straight back in.
          </p>
          <p>
            Drafts are written to{" "}
            <strong className="text-foreground">IndexedDB in your browser</strong> — not to
            DevBench servers. There is no account, no sync, and no network request when you
            save: clearing site data or switching machines means the vault is gone unless you
            exported a bundle first. That design is deliberate. Anything you paste here can be
            a token, a customer record, or an internal config, and the only place it should
            exist is on your device.
          </p>

          <h3 className="text-sm font-semibold text-foreground">Backup and transfer</h3>
          <p>
            <strong className="text-foreground">Export bundle</strong> downloads every entry as
            a single{" "}
            <code className="rounded bg-muted px-1">devbench-vault-YYYY-MM-DD.devbench.json</code>{" "}
            file you can commit to a private repo, stash in a password manager, or move to
            another browser. <strong className="text-foreground">Import (merge)</strong> adds
            the bundle&apos;s entries to what is already saved, keeping both;{" "}
            <strong className="text-foreground">Import (replace all)</strong> wipes the current
            vault and loads the bundle exactly — use it when restoring on a fresh machine.
            Imports are validated before they touch storage, so a malformed file is rejected
            with an error instead of corrupting your existing drafts.
          </p>

          <h3 className="text-sm font-semibold text-foreground">Good to know</h3>
          <p>
            The vault is per-browser and per-profile: Chrome and Firefox each keep their own
            copy, and private windows usually keep theirs only until the session ends. It has
            no size limit beyond your browser&apos;s storage quota (typically hundreds of
            megabytes), and entries are listed newest-first by update time. If a draft ever
            needs to become permanent documentation rather than a local note, the{" "}
            <Link href="/notepad" className="text-accent hover:underline">
              notepad
            </Link>{" "}
            keeps multi-tab working copies you can export as files, and{" "}
            <Link href="/workflows" className="text-accent hover:underline">
              tool pipelines
            </Link>{" "}
            can save reusable step chains alongside them.
          </p>
        </section>
      </main>
    </>
  );
}
