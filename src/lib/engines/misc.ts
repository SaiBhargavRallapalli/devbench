// Copyright (c) 2026 DevBench contributors. MIT License.
import type { Result } from "./_shared";

export function htmlToJsx(input: string): Result {
  try {
    let out = input;

    // Attribute renames
    out = out.replace(/\bclass=/g, "className=");
    out = out.replace(/\bfor=/g, "htmlFor=");
    out = out.replace(/\btabindex=/g, "tabIndex=");
    out = out.replace(/\breadonly\b/g, "readOnly");
    out = out.replace(/\bautocomplete=/g, "autoComplete=");
    out = out.replace(/\bautofocus\b/g, "autoFocus");
    out = out.replace(/\bchecked\b(?!=)/g, "defaultChecked");
    out = out.replace(/\bvalue=(?!.*defaultValue)/g, "defaultValue=");
    out = out.replace(/\bstroke-width=/g, "strokeWidth=");
    out = out.replace(/\bfill-rule=/g, "fillRule=");
    out = out.replace(/\bclip-path=/g, "clipPath=");
    out = out.replace(/\bstop-color=/g, "stopColor=");
    out = out.replace(/\bxlink:href=/g, "href=");

    // HTML events → React synthetic events
    const events: [RegExp, string][] = [
      [/\bonclick=/g, "onClick="],
      [/\bonchange=/g, "onChange="],
      [/\bonsubmit=/g, "onSubmit="],
      [/\bonkeydown=/g, "onKeyDown="],
      [/\bonkeyup=/g, "onKeyUp="],
      [/\bonkeypress=/g, "onKeyPress="],
      [/\bonmousedown=/g, "onMouseDown="],
      [/\bonmouseup=/g, "onMouseUp="],
      [/\bonmouseover=/g, "onMouseOver="],
      [/\bonmouseout=/g, "onMouseOut="],
      [/\bonmousemove=/g, "onMouseMove="],
      [/\bonfocus=/g, "onFocus="],
      [/\bonblur=/g, "onBlur="],
      [/\bonload=/g, "onLoad="],
      [/\bonerror=/g, "onError="],
    ];
    for (const [pattern, replacement] of events) {
      out = out.replace(pattern, replacement);
    }

    // Self-close void elements
    const voidElements = [
      "area", "base", "br", "col", "embed", "hr", "img", "input",
      "link", "meta", "param", "source", "track", "wbr",
    ];
    for (const el of voidElements) {
      // lgtm[js/redos] — `el` is from a hardcoded array of safe HTML tag names (no special chars)
      out = out.replace(
        new RegExp(`<(${el})(\\s[^>]*)?(?<!/)>`, "gi"), // CodeQL[js/redos]
        (_, tag, attrs) => `<${tag}${attrs || ""} />`,
      );
    }

    // style="..." → style={{ ... }} (best-effort)
    out = out.replace(/style="([^"]*)"/g, (_match, styles: string) => {
      const obj = styles
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const colonIdx = s.indexOf(":");
          if (colonIdx === -1) return null;
          const prop = s.slice(0, colonIdx).trim();
          const val2 = s.slice(colonIdx + 1).trim();
          const camelProp = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
          return `${camelProp}: "${val2}"`;
        })
        .filter(Boolean)
        .join(", ");
      return `style={{ ${obj} }}`;
    });

    // Comments: <!-- --> → {/* */}
    out = out.replace(/<!--([\s\S]*?)-->/g, (_m, c: string) => `{/*${c}*/}`);

    return out;
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

export function generateUlid(): string {
  const t = Date.now();
  const CHARS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let time = "";
  let n = t;
  for (let i = 9; i >= 0; i--) {
    time = CHARS[n % 32] + time;
    n = Math.floor(n / 32);
  }
  const randBytes = new Uint8Array(16);
  crypto.getRandomValues(randBytes);
  const rand = Array.from(randBytes, (b) => CHARS[b % 32]).join("");
  return time + rand;
}

export function generateNanoId(size = 21): string {
  const CHARS = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARS[b & 63]).join("");
}
