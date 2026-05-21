// Copyright (c) 2026 DevBench contributors. MIT License.
"use client";

import { useDevbenchShortcuts } from "@/hooks/use-devbench-shortcuts";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import PortholePromo from "@/components/PortholePromo";

/** Client-only globals: keyboard shortcuts, PWA install banner. */
export default function DevbenchClientProviders({ children }: { children: React.ReactNode }) {
  useDevbenchShortcuts();
  return (
    <>
      {children}
      <PwaInstallPrompt />
      <PortholePromo />
    </>
  );
}
