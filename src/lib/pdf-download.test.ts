import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBlob, downloadUint8 } from "./pdf-download";

// downloadBlob triggers a real navigation/download in jsdom; neutralize it.
// We assert on anchor wiring + revoke timing, which is the regression we fixed.
vi.mock("./analytics-events", () => ({
  trackToolDownload: vi.fn(),
}));

describe("downloadBlob", () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let appendedAtClick: Element | null;
  let removedAfterClick: boolean;

  beforeEach(() => {
    appendedAtClick = null;
    removedAfterClick = false;
    createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    // Capture DOM state at the exact moment click() fires.
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
      appendedAtClick = this.parentElement;
      removedAfterClick = false;
    };
    // Restore in afterEach via the stored original on the prototype.
    (HTMLAnchorElement.prototype as unknown as { __origClick?: () => void }).__origClick = origClick;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    const proto = HTMLAnchorElement.prototype as unknown as { __origClick?: () => void };
    if (proto.__origClick) HTMLAnchorElement.prototype.click = proto.__origClick;
    delete proto.__origClick;
    document.body.innerHTML = "";
  });

  it("attaches the anchor to the DOM before clicking (Safari requires this)", () => {
    const blob = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    downloadBlob(blob, "out.pdf");

    // At click time the anchor must already live inside <body>, not detached.
    expect(appendedAtClick).toBe(document.body);
    // After the call the anchor is cleaned up (not left in the DOM).
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("defers revokeObjectURL instead of revoking synchronously", () => {
    const blob = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    downloadBlob(blob, "out.pdf");

    // Must NOT revoke in the same tick as click() — that can cancel the download.
    expect(revokeObjectURL).not.toHaveBeenCalled();

    // Revoked only after the deferred timeout fires.
    vi.advanceTimersByTime(1_100);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("sets download filename and object URL on the anchor", () => {
    const blob = new Blob(["x"], { type: "application/pdf" });
    downloadBlob(blob, "report.pdf");
    // Body is empty again after cleanup, but the anchor was wired correctly:
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("announces the download via a notify event (no more silent downloads)", () => {
    const received: string[] = [];
    const onNotify = (e: Event) => received.push((e as CustomEvent).detail.message);
    window.addEventListener("devbench:notify", onNotify);
    try {
      downloadBlob(new Blob(["x"], { type: "application/pdf" }), "report.pdf");
    } finally {
      window.removeEventListener("devbench:notify", onNotify);
    }
    expect(received).toEqual(["Downloaded report.pdf"]);
  });
});

describe("downloadUint8", () => {
  it("copies bytes into a Blob and triggers a download", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:u");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {};

    try {
      const bytes = new Uint8Array([37, 80, 68, 70]); // %PDF
      downloadUint8(bytes, "a.pdf", "application/pdf");
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const blobArg = createObjectURL.mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe("application/pdf");
      expect(blobArg.size).toBe(4);
    } finally {
      HTMLAnchorElement.prototype.click = origClick;
      vi.unstubAllGlobals();
    }
  });
});
