// Copyright (c) 2026 DevBench contributors. MIT License.
import type { NotepadEncoding } from "@/lib/notepad-session";

export function encodeText(text: string, encoding: NotepadEncoding): Blob {
  switch (encoding) {
    case "utf-8-bom": {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const body = new TextEncoder().encode(text);
      const out = new Uint8Array(bom.length + body.length);
      out.set(bom, 0);
      out.set(body, bom.length);
      return new Blob([out], { type: "text/plain;charset=utf-8" });
    }
    case "utf-16le-bom": {
      const bom = 0xfeff;
      const out = new Uint8Array(2 + text.length * 2);
      out[0] = bom & 0xff;
      out[1] = (bom >> 8) & 0xff;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        out[2 + i * 2] = code & 0xff;
        out[2 + i * 2 + 1] = (code >> 8) & 0xff;
      }
      return new Blob([out], { type: "text/plain;charset=utf-16le" });
    }
    default:
      return new Blob([text], { type: "text/plain;charset=utf-8" });
  }
}

export function encodingLabel(encoding: NotepadEncoding): string {
  switch (encoding) {
    case "utf-8-bom":
      return "UTF-8-BOM";
    case "utf-16le-bom":
      return "UTF-16 LE BOM";
    default:
      return "UTF-8";
  }
}
