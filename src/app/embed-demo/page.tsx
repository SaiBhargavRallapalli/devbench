"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { createEmbedController } from "@/lib/embed-api";
import type { EmbedEvent } from "@/lib/embed-api";

export default function EmbedDemoPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [input, setInput] = useState("Hello from parent page");
  const [slug, setSlug] = useState("base64-encode");

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const api = createEmbedController(iframe);
    const off = api.onEvent((evt: EmbedEvent) => {
      setLog((l) => [...l.slice(-20), JSON.stringify(evt)]);
    });
    return off;
  }, [slug]);

  function push(cmd: string) {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const api = createEmbedController(iframe);
    if (cmd === "set") api.setInput(input);
    if (cmd === "run") api.run();
    if (cmd === "clear") api.clear();
    if (cmd === "get") api.getState();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Embed API demo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controls an iframe via <code className="rounded bg-muted px-1">postMessage</code>. Hosts can also load{" "}
            <code className="rounded bg-muted px-1">/embed-sdk.js</code> for{" "}
            <code className="rounded bg-muted px-1">DevBenchEmbed.createEmbedController</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="text-xs">
            Tool slug
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="block mt-1 rounded border border-border px-2 py-1 text-sm font-mono"
            />
          </label>
          <label className="text-xs flex-1 min-w-[200px]">
            Parent input
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="block mt-1 w-full rounded border border-border px-2 py-1 text-sm"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {["set", "run", "clear", "get"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => push(c)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted capitalize"
            >
              {c}
            </button>
          ))}
        </div>
        <iframe
          ref={iframeRef}
          title="DevBench embed"
          src={`/embed/${slug}`}
          className="w-full h-[420px] rounded-xl border border-border bg-card"
        />
        <pre className="text-[11px] font-mono bg-muted/30 rounded-lg p-3 max-h-40 overflow-auto">
          {log.length ? log.join("\n") : "Events will appear here…"}
        </pre>
      </main>
    </>
  );
}
