"use client";

import { useDevbenchShortcuts } from "@/hooks/use-devbench-shortcuts";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

/** Client-only globals: keyboard shortcuts, PWA install banner. */
export default function DevbenchClientProviders({ children }: { children: React.ReactNode }) {
  useDevbenchShortcuts();
  return (
    <>
      {children}
      <PwaInstallPrompt />
    </>
  );
}
