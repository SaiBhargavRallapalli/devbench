import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard, copyWithFeedback } from "./clipboard";
import { NOTIFY_EVENT_NAME, type NotifyDetail } from "./notify";

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

describe("copyWithFeedback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  function captureNotifications(): NotifyDetail[] {
    const seen: NotifyDetail[] = [];
    window.addEventListener(NOTIFY_EVENT_NAME, ((e: CustomEvent<NotifyDetail>) => {
      seen.push(e.detail);
    }) as EventListener);
    return seen;
  }

  it("resolves true and emits no notification on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const seen = captureNotifications();

    await expect(copyWithFeedback("hello")).resolves.toBe(true);
    expect(seen).toHaveLength(0);
  });

  it("resolves false and emits an error notification on total failure", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(false);
    const proto = Document.prototype as Document & { execCommand?: (commandId: string) => boolean };
    const prev = proto.execCommand;
    proto.execCommand = execCommand;
    const seen = captureNotifications();

    try {
      await expect(copyWithFeedback("x")).resolves.toBe(false);
      expect(seen).toHaveLength(1);
      expect(seen[0].kind).toBe("error");
      expect(seen[0].message).toMatch(/copy failed/i);
    } finally {
      proto.execCommand = prev;
    }
  });

  it("succeeds through the execCommand fallback without notifying", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    const proto = Document.prototype as Document & { execCommand?: (commandId: string) => boolean };
    const prev = proto.execCommand;
    proto.execCommand = execCommand;
    const seen = captureNotifications();

    try {
      await expect(copyWithFeedback("fallback")).resolves.toBe(true);
      expect(seen).toHaveLength(0);
    } finally {
      proto.execCommand = prev;
    }
  });
});
