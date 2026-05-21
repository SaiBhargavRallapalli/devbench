"use client";

import type { JsonWorkspaceTab } from "@/lib/json-workspace-types";
import { Braces, GitCompareArrows, Minimize2, Route, TreePine, Wrench } from "lucide-react";

type QuickAction = "validate" | "repair" | "minify";

type Props = {
  activeTab: JsonWorkspaceTab;
  onSelectTab: (tab: JsonWorkspaceTab) => void;
  onQuickAction: (action: QuickAction) => void;
};

const LINKS: {
  action?: QuickAction;
  tab?: JsonWorkspaceTab;
  label: string;
  icon: React.ReactNode;
  title: string;
}[] = [
  { action: "validate", tab: "format", label: "Validate", icon: <Braces size={14} />, title: "Format & validate JSON" },
  { action: "repair", tab: "format", label: "Repair", icon: <Wrench size={14} />, title: "Auto-fix broken JSON" },
  { action: "minify", tab: "format", label: "Minify", icon: <Minimize2 size={14} />, title: "Compress to one line" },
  { tab: "diff", label: "Diff", icon: <GitCompareArrows size={14} />, title: "Compare two JSON documents" },
  { tab: "path", label: "Path", icon: <Route size={14} />, title: "JSONPath query" },
  { tab: "tree", label: "Tree", icon: <TreePine size={14} />, title: "Interactive tree view" },
];

export default function JsonQuickNav({ activeTab, onSelectTab, onQuickAction }: Props) {
  return (
    <nav
      className="border-b border-border bg-muted/30 px-4 py-1.5 flex flex-wrap items-center gap-1 shrink-0"
      aria-label="JSON tool shortcuts"
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1 hidden sm:inline">
        Tools
      </span>
      {LINKS.map((link) => {
        const isActive = link.tab !== undefined && activeTab === link.tab;
        return (
          <button
            key={link.label}
            type="button"
            title={link.title}
            onClick={() => {
              if (link.tab) onSelectTab(link.tab);
              if (link.action) onQuickAction(link.action);
            }}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
            }`}
          >
            {link.icon}
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}
