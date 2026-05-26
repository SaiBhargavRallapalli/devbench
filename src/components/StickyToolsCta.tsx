"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench } from "lucide-react";

/** Compact sticky bar — appears after scrolling past the hero. */
export default function StickyToolsCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 420);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-4 py-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden"
      aria-hidden={!visible}
    >
      <Link
        href="#tools"
        className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Wrench className="h-4 w-4 shrink-0" aria-hidden />
        Open a Tool
      </Link>
    </div>
  );
}
