/** Run JSON format/minify in a Web Worker for large payloads (>256 KB). */

const THRESHOLD = 256 * 1024;

let workerUrl: string | null = null;

function getWorker(): Worker {
  if (!workerUrl) {
    workerUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/workers/json-format-worker.js`;
  }
  return new Worker(workerUrl);
}

let seq = 0;

export function shouldUseJsonWorker(input: string): boolean {
  return input.length >= THRESHOLD;
}

export function formatJsonInWorker(
  input: string,
  mode: "format" | "minify",
  indent = 2,
): Promise<{ output: string; error?: string }> {
  return new Promise((resolve) => {
    const id = ++seq;
    const worker = getWorker();
    const done = (result: { output: string; error?: string }) => {
      worker.terminate();
      resolve(result);
    };
    worker.onmessage = (ev: MessageEvent) => {
      if (ev.data?.id !== id) return;
      if (ev.data.ok) done({ output: ev.data.output });
      else done({ output: "", error: ev.data.error });
    };
    worker.onerror = () => done({ output: "", error: "JSON worker failed" });
    worker.postMessage({ id, input, mode, indent });
  });
}
