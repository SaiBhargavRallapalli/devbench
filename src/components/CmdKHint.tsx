// Copyright (c) 2026 DevBench contributors. MIT License.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const SEEN_KEY = "devbench:cmdk-hint-seen";
/** Delay before the hint fades in — long enough that it never races first paint. */
const SHOW_DELAY_MS = 1900;
/** How long the hint stays before dismissing itself. */
const VISIBLE_MS = 10500;

/**
 * One-time hint pointing at the header search button's ⌘K shortcut.
 *
 * Shows once per browser (localStorage flag), auto-dismisses, and also
 * dismisses the moment the palette opens by ANY path — clicking the search
 * button (`devbench:open-palette` event) or pressing ⌘K/Ctrl+K directly.
 * Desktop-only: mobile has no keyboard, so the hint is pointless there.
 *
 * Mounted inside the header's right-actions container; the header is sticky
 * (a positioned ancestor), so this anchors below it with `top-full`.
 */
export default function CmdKHint() {
  const [visible, setVisible] = useState(false);
  // Guards the whole lifecycle so an early dismissal (palette opened before
  // the show timer fired) can't be undone by a still-pending timer.
  const doneRef = useRef(false);

  const dismiss = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setVisible(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked — hint will simply show again next visit */
    }
  }, []);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return; // storage blocked — stay quiet rather than nag every visit
    }
    // Only timer/listener callbacks set state (never the effect body itself);
    // until then the hint stays `invisible` — out of the tab order and the
    // accessibility tree.
    const showTimer = window.setTimeout(() => {
      if (!doneRef.current) setVisible(true);
    }, SHOW_DELAY_MS);
    const hideTimer = window.setTimeout(dismiss, SHOW_DELAY_MS + VISIBLE_MS);

    const onOpenPalette = () => dismiss();
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") dismiss();
    };
    window.addEventListener("devbench:open-palette", onOpenPalette);
    window.addEventListener("keydown", onKeydown);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener("devbench:open-palette", onOpenPalette);
      window.removeEventListener("keydown", onKeydown);
    };
  }, [dismiss]);

  return (
    <div
      // sm: only — no keyboard on mobile. `invisible` keeps the faded-out
      // hint out of the tab order and the accessibility tree.
      className={`absolute right-4 top-full z-[60] mt-2 hidden origin-top-right scale-95 invisible opacity-0 transition-all duration-200 ease-out sm:block ${
        visible ? "visible scale-100 opacity-100" : ""
      }`}
    >
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
        <kbd
          aria-label="keyboard shortcut Command K"
          className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
        >
          ⌘K
        </kbd>
        <span className="text-sm text-muted-foreground">
          Search any tool with <span className="font-semibold text-foreground">⌘K</span>
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss keyboard shortcut hint"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
