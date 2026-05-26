"use client";

import type { ReactNode } from "react";

/** Accessible hover/focus tooltip for action buttons and links. */
export default function HoverTooltip({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative group/tooltip inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 w-max max-w-[15rem] -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-center text-[11px] font-medium leading-snug text-background opacity-0 shadow-md transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
