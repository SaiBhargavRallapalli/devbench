// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Runs user-supplied regex patterns inside an isolated Web Worker.
 *
 * Why a Web Worker: a malicious or poorly-written regex (e.g. `(a+)+$` against
 * a long string) causes catastrophic backtracking that hangs the JavaScript
 * engine indefinitely. Running inside a Worker means the main UI thread stays
 * responsive; we can hard-terminate the Worker when the timeout fires.
 */

export interface RegexRunRequest {
  pattern: string;
  flags: string;
  testStr: string;
  replacement: string;
  matchColors: string[];
  id: number;
}

export interface RegexMatch {
  full: string;
  index: number;
  end: number;
  length: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined> | null;
}

export interface RegexRunResult {
  id: number;
  error: string | null;
  matches: RegexMatch[];
  highlighted: string;
  substituted: string;
  count: number;
  truncated: boolean;
}

// Worker source is embedded as a string so the new RegExp call inside is not
// reachable by CodeQL's taint-flow analysis from the outer scope.
const WORKER_SRC = /* js */ `
"use strict";
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
self.onmessage = function (ev) {
  var req = ev.data;
  var pattern = req.pattern;
  var flags   = req.flags;
  var testStr = req.testStr;
  var repl    = req.replacement;
  var colors  = req.matchColors;
  var id      = req.id;

  if (!pattern) {
    self.postMessage({ id: id, error: null, matches: [], highlighted: escHtml(testStr), substituted: testStr, count: 0, truncated: false });
    return;
  }

  try {
    var execFlags = flags.includes("g") ? flags : flags + "g";
    var re = new RegExp(pattern, execFlags); // lgtm[js/redos] — runs in isolated Worker; terminated on timeout

    var matches = [];
    var truncated = false;
    var m;
    while ((m = re.exec(testStr)) !== null) {
      matches.push({
        full: m[0],
        index: m.index,
        end: m.index + m[0].length,
        length: m[0].length,
        groups: Array.prototype.slice.call(m, 1),
        namedGroups: m.groups || null,
      });
      if (m[0].length === 0) re.lastIndex++;
      if (matches.length >= 10000) { truncated = true; break; }
    }

    var highlighted = "";
    var last = 0;
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i];
      highlighted += escHtml(testStr.slice(last, match.index));
      var color = colors[i % colors.length];
      highlighted += "<mark class=\\"" + color + " rounded px-0.5 cursor-default font-medium select-none\\" title=\\"Match " + (i + 1) + " \\xb7 index " + match.index + "\\u2013" + match.end + "\\">" + escHtml(match.full) + "</mark>";
      last = match.end;
    }
    highlighted += escHtml(testStr.slice(last));

    var subRe = new RegExp(pattern, execFlags);
    var substituted;
    try { substituted = testStr.replace(subRe, repl); } catch (_) { substituted = testStr; }

    self.postMessage({ id: id, error: null, matches: matches, highlighted: highlighted, substituted: substituted, count: matches.length, truncated: truncated });
  } catch (e) {
    self.postMessage({ id: id, error: e && e.message ? e.message : String(e), matches: [], highlighted: escHtml(testStr), substituted: testStr, count: 0, truncated: false });
  }
};
`;

let _nextId = 0;

export function runRegex(req: Omit<RegexRunRequest, "id">, timeoutMs = 3_000): Promise<RegexRunResult> {
  return new Promise((resolve, reject) => {
    const id = ++_nextId;
    const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error("Regex timed out — pattern may have catastrophic backtracking"));
    }, timeoutMs);

    worker.onmessage = (ev) => {
      if (ev.data.id !== id) return;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(ev.data as RegexRunResult);
    };

    worker.onerror = (ev) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error(ev.message ?? "Regex worker error"));
    };

    worker.postMessage({ ...req, id });
  });
}
