"use client";

import { JSON_REPAIR_EXAMPLES } from "@/lib/json-repair-examples";

type Props = {
  onTryExample: (broken: string) => void;
  compact?: boolean;
};

export default function JsonRepairExamples({ onTryExample, compact }: Props) {
  return (
    <div className={compact ? "flex flex-wrap items-center gap-1.5" : "space-y-2"}>
      {!compact && (
        <p className="text-xs text-muted-foreground">
          Try an example (like{" "}
          <a
            href="https://jsonlint.com/json-repair"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            JSONLint Repair
          </a>
          ):
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {JSON_REPAIR_EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => onTryExample(ex.broken)}
            className="rounded-full border border-border bg-muted/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-accent/10 transition-colors"
            title={ex.broken.length > 80 ? `${ex.broken.slice(0, 80)}…` : ex.broken}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
