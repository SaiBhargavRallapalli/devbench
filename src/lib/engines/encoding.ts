// Copyright (c) 2026 DevBench contributors. MIT License.
import type { Result } from "./_shared";

export function base64Encode(input: string): Result {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch (e) {
    return { output: "", error: `Encoding failed: ${(e as Error).message}` };
  }
}

export function base64Decode(input: string): Result {
  try {
    return decodeURIComponent(escape(atob(input.trim())));
  } catch {
    return { output: "", error: "Invalid Base64 string" };
  }
}

export function urlEncode(input: string): Result {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): Result {
  try {
    return decodeURIComponent(input);
  } catch {
    return { output: "", error: "Invalid URL-encoded string" };
  }
}

export function htmlEntityEncode(input: string): Result {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlEntityDecode(input: string): Result {
  return input
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

export function textToHex(input: string): Result {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

export function hexToText(input: string): Result {
  try {
    const hex = input.replace(/\s+/g, "");
    if (hex.length % 2 !== 0) return { output: "", error: "Hex string must have even length" };
    if (!hex) return "";
    const bytes = new Uint8Array((hex.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)));
    return new TextDecoder().decode(bytes);
  } catch {
    return { output: "", error: "Invalid hex string" };
  }
}

export function textToBinary(input: string): Result {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

export function binaryToText(input: string): Result {
  try {
    const groups = input.trim().split(/\s+/);
    const bytes = new Uint8Array(groups.map((g) => parseInt(g, 2)));
    return new TextDecoder().decode(bytes);
  } catch {
    return { output: "", error: "Invalid binary string" };
  }
}

export function rot13(input: string): Result {
  return input.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
  "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.",
  "$": "...-..-", "@": ".--.-.",
};
const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

export function morseEncode(input: string): Result {
  if (input.includes(".-") || input.includes("...")) {
    return morseDecode(input);
  }
  return input
    .toUpperCase()
    .split("")
    .map((c) => (c === " " ? "/" : MORSE_MAP[c] || ""))
    .filter(Boolean)
    .join(" ");
}

export function morseDecode(input: string): Result {
  return input
    .split(" / ")
    .map((word) =>
      word
        .split(" ")
        .map((c) => REVERSE_MORSE[c] || "")
        .join("")
    )
    .join(" ");
}
