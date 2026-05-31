// Copyright (c) 2026 DevBench contributors. MIT License.

export function trimTrailingWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[\t ]+$/, ""))
    .join("\n");
}

export function trimLeadingWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/^[\t ]+/, ""))
    .join("\n");
}

export function removeEmptyLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

export function sortLines(text: string, numeric = false): string {
  const lines = text.split("\n");
  return lines
    .slice()
    .sort((a, b) => {
      if (numeric) {
        const na = parseFloat(a);
        const nb = parseFloat(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
      }
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    })
    .join("\n");
}

export function reverseLines(text: string): string {
  return text.split("\n").reverse().join("\n");
}

export function duplicateLines(text: string): string {
  return text
    .split("\n")
    .flatMap((line) => [line, line])
    .join("\n");
}

export function indentLines(text: string, spaces = 2): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

export function unindentLines(text: string, spaces = 2): string {
  const re = new RegExp(`^[ \\t]{1,${spaces}}`);
  return text
    .split("\n")
    .map((line) => line.replace(re, ""))
    .join("\n");
}

export function toggleLineComment(text: string, language: string): string {
  const [prefix, suffix] = commentSyntax(language);
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith(prefix) && (!suffix || trimmed.endsWith(suffix))) {
        let core = trimmed.slice(prefix.length);
        if (suffix && core.endsWith(suffix)) core = core.slice(0, -suffix.length);
        return line.slice(0, line.length - trimmed.length) + core.trimStart();
      }
      return line.slice(0, line.length - trimmed.length) + prefix + trimmed + suffix;
    })
    .join("\n");
}

function commentSyntax(language: string): [string, string] {
  switch (language) {
    case "html":
    case "xml":
      return ["<!-- ", " -->"];
    case "css":
    case "scss":
    case "less":
      return ["/* ", " */"];
    case "python":
    case "shell":
    case "yaml":
    case "ruby":
    case "perl":
    case "powershell":
    case "r":
      return ["# ", ""];
    case "sql":
      return ["-- ", ""];
    default:
      return ["// ", ""];
  }
}

export function insertAtCursor(
  content: string,
  line: number,
  column: number,
  insert: string,
): string {
  const lines = content.split("\n");
  const idx = Math.max(0, Math.min(lines.length - 1, line - 1));
  const row = lines[idx] ?? "";
  lines[idx] = row.slice(0, column - 1) + insert + row.slice(column - 1);
  return lines.join("\n");
}

export function formatDateTime(mode: "iso" | "local" | "date" | "time"): string {
  const d = new Date();
  switch (mode) {
    case "iso":
      return d.toISOString();
    case "date":
      return d.toLocaleDateString();
    case "time":
      return d.toLocaleTimeString();
    default:
      return d.toLocaleString();
  }
}
