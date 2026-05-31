"use client";

import { Suspense } from "react";
import NotepadApp from "@/components/notepad/NotepadApp";
import type { Tool } from "@/lib/tools-registry";

export default function NotepadPlusPlusTool({ tool }: { tool: Tool }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Loading editor…
        </div>
      }
    >
      <NotepadApp mode="compact" tool={tool} />
    </Suspense>
  );
}
