import { PLAYGROUND_PYODIDE_INDEX_URL, SANDBOX_MAX_CODE_CHARS } from "@/lib/playground/constants";

/** Only this message-based facade is exposed to the page. Python runs in an
 * opaque-origin iframe's Worker, never in the site's Window or origin. */
export type PyodideHandle = {
  setStdin(options: { stdin: () => string | null | undefined }): void;
  setStdout(options: { batched: (s: string) => void }): void;
  setStderr(options: { batched: (s: string) => void }): void;
  runPythonAsync(code: string, options?: { filename?: string }): Promise<void>;
};
let handle: PyodideHandle | null = null;

export function ensurePyodide(): Promise<PyodideHandle> {
  if (handle) return Promise.resolve(handle);
  let frame: HTMLIFrameElement | null = null;
  let stdin: () => string | null | undefined = () => null;
  let stdout = (_s: string) => {};
  let stderr = (_s: string) => {};
  let serial = 0;
  let messages = 0;
  let outputChars = 0;
  let pending: { id: number; resolve: () => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;

  const workerSource = `
importScripts(${JSON.stringify(PLAYGROUND_PYODIDE_INDEX_URL + "pyodide.js")});
let py;
onmessage=async({data:d})=>{
  let count=0, chars=0;
  const output=(type,text)=>{text=String(text).slice(0,8192);if(++count<=500 && (chars+=text.length)<=200000)postMessage({id:d.id,type,text});};
  try {
    py=py||await loadPyodide({indexURL:${JSON.stringify(PLAYGROUND_PYODIDE_INDEX_URL)},fullStdLib:false});
    let i=0;py.setStdin({stdin:()=>i<d.stdin.length?d.stdin[i++]:null});
    py.setStdout({batched:s=>output('stdout',s)});py.setStderr({batched:s=>output('stderr',s)});
    await py.runPythonAsync(d.code,{filename:d.filename||'<playground>'});
    postMessage({id:d.id,type:'done'});
  }catch(e){postMessage({id:d.id,type:'error',text:String(e).slice(0,16000)});}
};`;
  function getFrame() {
    if (frame) return frame;
    const f = document.createElement("iframe");
    f.sandbox.add("allow-scripts");
    f.hidden = true;
    f.title = "Isolated Python runtime";
    f.srcdoc = `<!doctype html><meta name="referrer" content="no-referrer"><script>
const worker=new Worker(URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}],{type:'text/javascript'})));
worker.onmessage=e=>parent.postMessage({source:'devbench-python',...e.data},'*');
worker.onerror=()=>parent.postMessage({source:'devbench-python',type:'error',text:'Python worker failed to load.'},'*');
onmessage=e=>{if(e.source===parent&&e.data?.type==='run')worker.postMessage(e.data);};
parent.postMessage({source:'devbench-python',type:'ready'},'*');
<` + `/script>`;
    frame = f;
    document.body.appendChild(f);
    return f;
  }
  let queued: unknown = null;
  window.addEventListener("message", (event) => {
    if (!frame || event.source !== frame.contentWindow) return;
    const d = event.data;
    if (!d || d.source !== "devbench-python") return;
    if (d.type === "ready") {
      if (queued) frame.contentWindow?.postMessage(queued, "*");
      queued = null;
      return;
    }
    if (!pending || (d.id !== undefined && d.id !== pending.id)) return;
    if ((d.type === "stdout" || d.type === "stderr") && typeof d.text === "string") {
      const text = d.text.slice(0, 8192);
      if (++messages <= 500 && (outputChars += text.length) <= 200000) {
        if (d.type === "stdout") stdout(text); else stderr(text);
      }
    }
    if (d.type === "done" || d.type === "error") {
      const current = pending;
      pending = null;
      clearTimeout(current.timer);
      if (d.type === "done") current.resolve();
      else current.reject(new Error(typeof d.text === "string" ? d.text.slice(0, 16000) : "Python failed."));
    }
  });
  handle = {
    setStdin: (o) => { stdin = o.stdin; },
    setStdout: (o) => { stdout = o.batched; },
    setStderr: (o) => { stderr = o.batched; },
    runPythonAsync(code, options) {
      if (pending) return Promise.reject(new Error("Python is already running."));
      if (code.length > SANDBOX_MAX_CODE_CHARS) return Promise.reject(new Error("Code exceeds 256 KB limit."));
      const input: string[] = [];
      let size = 0;
      for (let i = 0; i < 50000; i++) {
        const line = stdin();
        if (line == null) break;
        size += line.length;
        if (size > 50000) return Promise.reject(new Error("Stdin exceeds 50 KB limit."));
        input.push(line);
      }
      messages = 0; outputChars = 0;
      const id = ++serial;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          frame?.remove(); frame = null; queued = null; pending = null;
          reject(new Error("Python stopped after 60 seconds. Run again to restart the interpreter."));
        }, 60000);
        pending = { id, resolve, reject, timer };
        const message = { type: "run", id, code, stdin: input, filename: options?.filename };
        if (frame) frame.contentWindow?.postMessage(message, "*");
        else { queued = message; getFrame(); }
      });
    },
  };
  return Promise.resolve(handle);
}
