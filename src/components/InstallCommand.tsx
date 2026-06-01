"use client";

import CopyButton from "@/components/CopyButton";

type InstallCommandProps = {
  command: string;
  label?: string;
};

export default function InstallCommand({ command, label }: InstallCommandProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      {label ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <code className="block overflow-x-auto text-sm font-mono text-foreground whitespace-pre">
          {command}
        </code>
        <CopyButton text={command} className="shrink-0 self-start sm:self-center" />
      </div>
    </div>
  );
}
