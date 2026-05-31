"use client";

import { useEffect, useRef, useState } from "react";

export type MenuItem =
  | { type: "separator" }
  | {
      type: "item";
      label: string;
      shortcut?: string;
      disabled?: boolean;
      onClick: () => void;
    }
  | { type: "submenu"; label: string; items: MenuItem[] };

export function NotepadMenuBar({
  menus,
}: {
  menus: { label: string; items: MenuItem[] }[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div
      ref={barRef}
      className="flex flex-wrap items-center gap-0 border-b border-border bg-muted/30 px-1 text-xs"
      role="menubar"
    >
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            type="button"
            role="menuitem"
            aria-haspopup
            aria-expanded={open === menu.label}
            onClick={() => setOpen(open === menu.label ? null : menu.label)}
            className={`rounded px-2.5 py-1.5 font-medium transition-colors ${
              open === menu.label
                ? "bg-accent/15 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {menu.label}
          </button>
          {open === menu.label && (
            <div
              role="menu"
              className="absolute left-0 top-full z-50 min-w-[220px] rounded-lg border border-border bg-popover py-1 shadow-lg"
            >
              {menu.items.map((item, i) => (
                <MenuRow
                  key={i}
                  item={item}
                  onClose={() => setOpen(null)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MenuRow({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const [subOpen, setSubOpen] = useState(false);

  if (item.type === "separator") {
    return <div className="my-1 h-px bg-border" role="separator" />;
  }

  if (item.type === "submenu") {
    return (
      <div
        className="relative"
        onMouseEnter={() => setSubOpen(true)}
        onMouseLeave={() => setSubOpen(false)}
      >
        <button
          type="button"
          className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-muted"
        >
          {item.label}
          <span className="text-muted-foreground">›</span>
        </button>
        {subOpen && (
          <div className="absolute left-full top-0 z-50 min-w-[200px] rounded-lg border border-border bg-popover py-1 shadow-lg">
            {item.items.map((sub, j) => (
              <MenuRow key={j} item={sub} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={() => {
        if (item.disabled) return;
        item.onClick();
        onClose();
      }}
      className="flex w-full items-center justify-between gap-6 px-3 py-1.5 text-left hover:bg-muted disabled:opacity-40"
    >
      <span>{item.label}</span>
      {item.shortcut && (
        <span className="font-mono text-[10px] text-muted-foreground">{item.shortcut}</span>
      )}
    </button>
  );
}
