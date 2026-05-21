// Copyright (c) 2026 DevBench contributors. MIT License.
import type { JsonError } from "./types";

export function parseJsonError(input: string): JsonError | null {
  try {
    JSON.parse(input);
    return null;
  } catch (e) {
    const msg = (e as SyntaxError).message;
    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      let line = 1;
      let column = 1;
      for (let i = 0; i < pos && i < input.length; i++) {
        if (input[i] === "\n") {
          line++;
          column = 1;
        } else {
          column++;
        }
      }
      return { message: msg, line, column };
    }
    return { message: msg, line: 1, column: 1 };
  }
}
