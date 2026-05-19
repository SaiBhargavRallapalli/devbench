"use client";

import { useState, useRef } from "react";
import { FileUp, Terminal, Braces, X } from "lucide-react";
import {
  parseHar,
  parseCurlCommand,
  parseOpenApi,
  parsePostmanCollection,
  type ImportedRequest,
} from "@/lib/api-import";

export type ApiImportApply = (req: ImportedRequest) => void;

export default function ApiImportPanel({ onApply, onClose }: { onApply: ApiImportApply; onClose: () => void }) {
  const [tab, setTab] = useState<"har" | "curl" | "openapi" | "postman">("har");
  const [curlText, setCurlText] = useState('curl -X GET "https://httpbin.org/get"');
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<ImportedRequest[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingKind = useRef<"har" | "openapi" | "postman">("har");

  function applyOne(req: ImportedRequest) {
    onApply(req);
    onClose();
  }

  function openFile(kind: "har" | "openapi" | "postman") {
    setError("");
    pendingKind.current = kind;
    fileRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const text = await f.text();
      const kind = pendingKind.current;
      const list =
        kind === "har"
          ? parseHar(text)
          : kind === "openapi"
            ? parseOpenApi(text)
            : parsePostmanCollection(text);
      setPicked(list);
      if (list.length === 1) applyOne(list[0]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function importCurl() {
    setError("");
    try {
      applyOne(parseCurlCommand(curlText));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const tabClass = (id: typeof tab) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg ${tab === id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Import request</h3>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-muted" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".json,.har" className="hidden" onChange={onFileChange} />
      <div className="flex flex-wrap gap-1">
        <button type="button" className={tabClass("har")} onClick={() => setTab("har")}>
          HAR
        </button>
        <button type="button" className={tabClass("curl")} onClick={() => setTab("curl")}>
          cURL
        </button>
        <button type="button" className={tabClass("openapi")} onClick={() => setTab("openapi")}>
          OpenAPI
        </button>
        <button type="button" className={tabClass("postman")} onClick={() => setTab("postman")}>
          Postman
        </button>
      </div>

      {tab === "har" && (
        <button
          type="button"
          onClick={() => openFile("har")}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm hover:bg-muted/50"
        >
          <FileUp className="w-4 h-4 text-accent" />
          Upload HAR export from Chrome DevTools
        </button>
      )}

      {tab === "openapi" && (
        <button
          type="button"
          onClick={() => openFile("openapi")}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm hover:bg-muted/50"
        >
          <Braces className="w-4 h-4 text-accent" />
          Upload OpenAPI 3 JSON spec
        </button>
      )}

      {tab === "postman" && (
        <button
          type="button"
          onClick={() => openFile("postman")}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm hover:bg-muted/50"
        >
          <FileUp className="w-4 h-4 text-accent" />
          Upload Postman collection v2.1 JSON
        </button>
      )}

      {tab === "curl" && (
        <div className="space-y-2">
          <textarea
            value={curlText}
            onChange={(e) => setCurlText(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={importCurl}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground"
          >
            <Terminal className="w-3.5 h-3.5" />
            Import cURL
          </button>
        </div>
      )}

      {picked.length > 1 && (
        <ul className="max-h-48 overflow-auto rounded-lg border border-border divide-y divide-border text-xs">
          {picked.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-muted"
                onClick={() => applyOne(r)}
              >
                <span className="font-semibold text-accent">{r.method}</span> {r.label ?? r.url}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
