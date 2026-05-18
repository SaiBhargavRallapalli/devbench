import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "./clipboard";

describe("copyToClipboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("uses navigator.clipboard.writeText when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await copyToClipboard("hello");

    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when clipboard API throws", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    const proto = Document.prototype as Document & { execCommand?: (commandId: string) => boolean };
    const prev = proto.execCommand;
    proto.execCommand = execCommand;

    try {
      await copyToClipboard("fallback");
      expect(execCommand).toHaveBeenCalledWith("copy");
    } finally {
      proto.execCommand = prev;
    }
  });

  it("throws when execCommand returns false after clipboard throws", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(false);
    const proto = Document.prototype as Document & { execCommand?: (commandId: string) => boolean };
    const prev = proto.execCommand;
    proto.execCommand = execCommand;

    try {
      await expect(copyToClipboard("x")).rejects.toThrow(/blocked/i);
    } finally {
      proto.execCommand = prev;
    }
  });
});
