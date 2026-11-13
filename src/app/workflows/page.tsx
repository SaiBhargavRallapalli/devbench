"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Trash2, Copy, Check, GripVertical, Save } from "lucide-react";
import Header from "@/components/Header";
import ToolPageActions from "@/components/ToolPageActions";
import {
  PIPELINE_PRESETS,
  PIPELINE_STEP_CATALOG,
  runPipeline,
  type PipelineStep,
} from "@/lib/tool-pipelines";
import { encodeSharedToolState } from "@/lib/shareable-tool-state";
import {
  listSavedPipelines,
  savePipeline,
  deleteSavedPipeline,
  type SavedPipeline,
} from "@/lib/pipeline-storage";
import { copyWithFeedback } from "@/lib/clipboard";

export default function WorkflowsPage() {
  const [input, setInput] = useState('{\n  "hello": "world"\n}');
  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_PRESETS[0].steps);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [stepLog, setStepLog] = useState<{ label: string; error: string }[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<SavedPipeline[]>(() => listSavedPipelines());
  const [saveName, setSaveName] = useState("My pipeline");

  const run = useCallback(async () => {
    setRunning(true);
    setError("");
    setStepLog([]);
    const result = await runPipeline(input, steps);
    setStepLog(result.steps.map((s) => ({ label: s.step.label, error: s.error })));
    setOutput(result.finalOutput);
    setError(result.finalError);
    setRunning(false);
  }, [input, steps]);

  function loadPreset(id: string) {
    const p = PIPELINE_PRESETS.find((x) => x.id === id);
    if (p) setSteps([...p.steps]);
  }

  function addStep(slug: string) {
    const cat = PIPELINE_STEP_CATALOG.find((s) => s.slug === slug);
    if (!cat) return;
    setSteps((s) => [...s, { ...cat, id: `s_${Date.now()}` }]);
  }

  function removeStep(i: number) {
    setSteps((s) => s.filter((_, idx) => idx !== i));
  }

  const sharePreview =
    typeof window !== "undefined"
      ? `${window.location.origin}/workflows${encodeSharedToolState(input)}`.slice(0, 72)
      : "/workflows#state=…";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8 space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Tool pipelines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chain transformations client-side — no copy-paste between tools. All steps run in your browser.
          </p>
          <div className="mt-3">
            <ToolPageActions
              slug="workflows"
              getContent={() => input}
              getContent2={() => output}
              vaultTitle="Pipeline I/O"
            />
          </div>
        </div>
        {saved.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Saved:</span>
            {saved.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSteps([...p.steps])}
                  className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
                >
                  {p.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteSavedPipeline(p.id);
                    setSaved(listSavedPipelines());
                  }}
                  className="text-[10px] text-muted-foreground hover:text-destructive px-0.5"
                  aria-label="Delete saved pipeline"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="rounded-lg border border-border px-2 py-1 text-xs w-40"
            placeholder="Pipeline name"
          />
          <button
            type="button"
            onClick={() => {
              savePipeline(saveName.trim() || "Pipeline", steps);
              setSaved(listSavedPipelines());
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
          >
            <Save className="w-3 h-3" />
            Save pipeline
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPreset(p.id)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              className="w-full rounded-lg border border-border bg-card p-3 font-mono text-xs"
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Pipeline steps</label>
              <select
                className="text-xs rounded border border-border bg-background px-2 py-1"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) addStep(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">+ Add step…</option>
                {PIPELINE_STEP_CATALOG.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <ul className="space-y-1 rounded-lg border border-border p-2 min-h-[120px]">
              {steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs">
                  <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="flex-1 font-medium">{i + 1}. {s.label}</span>
                  <button type="button" onClick={() => removeStep(i)} className="p-1 hover:text-destructive" aria-label="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void run()}
              disabled={running || !steps.length}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {running ? "Running…" : "Run pipeline"}
            </button>
            {stepLog.length > 0 && (
              <ol className="text-[11px] text-muted-foreground space-y-0.5">
                {stepLog.map((s, i) => (
                  <li key={i}>
                    {s.label}: {s.error ? <span className="text-destructive">{s.error}</span> : "ok"}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Final output</label>
            <button
              type="button"
              onClick={() => {
                copyWithFeedback(output).then((ok) => {
                  if (!ok) return;
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              className="inline-flex items-center gap-1 text-xs text-accent"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={10}
            className="w-full rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Share input state: <code className="rounded bg-muted px-1">{sharePreview}…</code>
        </p>

        <section className="space-y-4 border-t border-border pt-8 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            What tool pipelines are — and when to use one
          </h2>
          <p>
            A pipeline is a chain of DevBench transformations run back to back on one piece of
            input. Instead of converting in tool A, copying the result, pasting it into tool B,
            and repeating until you lose track of which step mangled the data, you stack the
            steps once and press <strong className="text-foreground">Run pipeline</strong>. Each
            step&apos;s output becomes the next step&apos;s input automatically, the log under
            the button reports ok or the exact failure per step, and the final output lands in
            the copy box at the bottom.
          </p>
          <p>
            Everything runs <strong className="text-foreground">client-side</strong> — the chain
            never leaves your browser, so a pipeline that starts with a customer CSV and ends
            in an API payload handles the whole journey locally. Common chains: format then
            minify JSON, decode Base64 then URL-decode, convert YAML to JSON then to TypeScript
            types, or hash a string and slugify the result. The{" "}
            <strong className="text-foreground">presets</strong> above the editor load a few
            ready-made examples; the <strong className="text-foreground">+ Add step</strong>{" "}
            dropdown lists the full catalog — format, minify, encode, decode, escape, hash,
            slugify, Markdown↔HTML, and the JSON↔YAML↔CSV↔XML converters.
          </p>

          <h3 className="text-sm font-semibold text-foreground">Saving and sharing chains</h3>
          <p>
            <strong className="text-foreground">Save pipeline</strong> stores the step sequence
            in your browser so it appears in the Saved row next time — rebuild-free reuse for
            the transformations you run weekly. The share link encodes the current input in the
            URL hash (<code className="rounded bg-muted px-1">/workflows#state=…</code>), which
            makes it easy to hand a colleague the exact starting data without a file
            attachment; the steps themselves are reconstructed on their side from the preset or
            saved name. Removing a step is one click, reordering happens as you add them, and a
            failing step does not abort the log — you see precisely where the chain broke.
          </p>

          <h3 className="text-sm font-semibold text-foreground">Pipelines vs. the individual tools</h3>
          <p>
            Use a single tool page when the task is one-shot — you need one conversion and you
            are done. Use a pipeline when the same sequence recurs or when intermediate copies
            are where mistakes creep in: pasting the wrong tab, trimming a character, or
            re-running an earlier step on stale data. If a chain becomes part of your daily
            workflow, save it; if you also want the input persisted rather than only the steps,
            the <Link href="/vault" className="text-accent hover:underline">project vault</Link>{" "}
            stores pipeline I/O alongside your other drafts.
          </p>
        </section>
      </main>
    </>
  );
}
