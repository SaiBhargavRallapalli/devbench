"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Global keyboard shortcuts (when not typing in inputs). */
export function useDevbenchShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const editing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") return; // palette

      if (editing) return;

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "V") {
        e.preventDefault();
        router.push("/vault");
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "W") {
        e.preventDefault();
        router.push("/workflows");
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "J") {
        e.preventDefault();
        router.push("/json");
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}
