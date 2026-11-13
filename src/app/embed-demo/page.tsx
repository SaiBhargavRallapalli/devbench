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

        <section className="space-y-4 border-t border-border pt-8 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            Embed any DevBench tool in your own page
          </h2>
          <p>
            The DevBench Embed API lets you drop a tool into your website or app inside an
            iframe and control it from your own JavaScript. Set the input, trigger a run, read
            the output, and react to lifecycle events — all through{" "}
            <code className="rounded bg-muted px-1">postMessage</code>, with no server component
            and no API key. Everything executes in the visitor&apos;s browser, so a page that
            embeds the Base64 encoder processes its users&apos; data exactly like the standalone
            tool does: locally, with nothing sent to DevBench.
          </p>

          <h3 className="text-sm font-semibold text-foreground">Quick start</h3>
          <pre className="text-[11px] font-mono bg-muted/30 rounded-lg p-3 overflow-auto">{`<iframe id="tool" src="https://www.devbench.co.in/embed/base64-encode"
        width="100%" height="400" style="border:0"></iframe>
<script src="https://www.devbench.co.in/embed-sdk.js"></script>
<script>
  const api = DevBenchEmbed.createEmbedController(
    document.getElementById("tool")
  );
  api.onEvent((evt) => {
    if (evt.type === "OUTPUT") console.log(evt.output);
  });
  api.setInput("Hello world");
  api.run();
</script>`}</pre>
          <p>
            Load <code className="rounded bg-muted px-1">/embed-sdk.js</code> from any host
            page, create a controller around the iframe, and drive it. The same-origin demo
            above uses <code className="rounded bg-muted px-1">@/lib/embed-api</code> directly —
            identical protocol, no SDK download.
          </p>

          <h3 className="text-sm font-semibold text-foreground">Message protocol</h3>
          <p>
            Commands flow parent → iframe: <strong className="text-foreground">SET_INPUT</strong>{" "}
            (string payload up to 512 KB), <strong className="text-foreground">RUN</strong>,{" "}
            <strong className="text-foreground">CLEAR</strong>,{" "}
            <strong className="text-foreground">GET_STATE</strong>, and{" "}
            <strong className="text-foreground">CONFIGURE</strong> (theme, auto-run). Events flow
            iframe → parent: <strong className="text-foreground">READY</strong> when the tool
            mounts, <strong className="text-foreground">STATE</strong> with the full
            input/output pair, and <strong className="text-foreground">OUTPUT</strong> after each
            run. Every message carries <code className="rounded bg-muted px-1">source:
            &quot;devbench-embed&quot;</code> so hosts can filter aggressively.
          </p>

          <h3 className="text-sm font-semibold text-foreground">Security model</h3>
          <p>
            The iframe accepts commands only from <code className="rounded bg-muted px-1">window.parent</code>,
            and the controller only accepts events from the iframe&apos;s content window — both
            origin checks are built in, so a third frame cannot inject input or spoof output.
            Payloads above the size caps are silently dropped rather than partially applied.
            Hosts that need stricter isolation can set{" "}
            <code className="rounded bg-muted px-1">autoRun: false</code> via CONFIGURE so nothing
            executes until you explicitly call <code className="rounded bg-muted px-1">run()</code>.
          </p>

          <h3 className="text-sm font-semibold text-foreground">When to embed vs. link</h3>
          <p>
            Embed when the tool is part of your flow — a generator inside your docs, an encoder
            inside your admin panel, a formatter inside your dashboard. Link to{" "}
            <code className="rounded bg-muted px-1">devbench.co.in/tools/…</code> when you want
            the full page with guides and FAQs. Both are free; embedding carries no attribution
            requirement, though a link back is appreciated.
          </p>
        </section>
      </main>
    </>
  );
}
