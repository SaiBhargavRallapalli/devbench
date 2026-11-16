import type { PyodideHandle } from "@/lib/playground/pyodide-loader";
import { stdinLinesFromText } from "@/lib/playground/js-sandbox-preamble";

/** Feed `sys.stdin` line-by-line from the Stdin tab (one line per read). */
export function installPyodideStdin(py: PyodideHandle, stdinText: string): void {
  const lines = stdinLinesFromText(stdinText);
  let i = 0;
  py.setStdin({
    stdin: () => {
      if (i >= lines.length) return null;
      return lines[i++] + "\n";
    },
  });
}
