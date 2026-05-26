// Copyright (c) 2026 DevBench contributors. MIT License.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Menu, X, Search, Wrench } from "lucide-react";
import DevBenchMark from "@/components/DevBenchMark";
import { useExternalNavOrigin } from "@/hooks/use-external-nav-origin";
import { resolveToolHref } from "@/lib/site-config";
import { HEADER_NAV_LINKS } from "@/lib/header-navigation";

export default function Header() {
  const [dark, setDark]         = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { origin: navOrigin, homePath } = useExternalNavOrigin();

  useEffect(() => {
    // Inline script in layout already applied classes — sync icon state from DOM.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));

    function onStorage(e: StorageEvent) {
      if (e.key !== "theme") return;
      const root = document.documentElement;
      const t = localStorage.getItem("theme");
      if (t === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        setDark(true);
      } else if (t === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
        setDark(false);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
        root.classList.remove("light");
        setDark(prefersDark);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = !dark;
    setDark(next);
    if (next) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light"); // blocks OS dark-mode media query
    }
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-border bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-13 max-w-screen-2xl items-center gap-1 px-4">

        {/* Logo */}
        <Link
          href={resolveToolHref("/", navOrigin, homePath)}
          className="flex shrink-0 items-center gap-2 text-foreground hover:text-accent transition-colors mr-3"
        >
          <DevBenchMark className="h-6 w-6 shrink-0 text-accent" />
          <span className="text-base font-bold tracking-tight">DevBench</span>
        </Link>

        {/* Nav — all items visible on desktop */}
        <nav
          className="hidden flex-1 items-center lg:flex"
          aria-label="Main navigation"
        >
          <ul className="flex flex-wrap items-center">
            {HEADER_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={resolveToolHref(link.href, navOrigin, homePath)}
                  aria-label={link.ariaLabel}
                  className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground whitespace-nowrap"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Link
            href={resolveToolHref("/#tools", navOrigin, homePath)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Jump to the tool grid — pick any tool and run it in your browser"
          >
            <Wrench className="h-4 w-4 shrink-0" aria-hidden />
            Open a Tool
          </Link>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("devbench:open-palette"))}
            aria-label="Search tools — open command palette"
            className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:gap-1.5 sm:px-3 rounded-lg border border-border text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Search</span>
            <kbd aria-label="keyboard shortcut Command K" className="hidden sm:inline text-[10px] font-mono text-muted-foreground">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            suppressHydrationWarning
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark}
          >
            {dark ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen ? "true" : "false"}
            aria-haspopup="true"
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X aria-hidden="true" className="h-4 w-4" /> : <Menu aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav — mount only when open so hidden content is not in the accessibility tree */}
      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-background px-4 pb-3 pt-2 lg:hidden"
          aria-label="Main navigation"
        >
          <Link
            href={resolveToolHref("/#tools", navOrigin, homePath)}
            onClick={() => setMenuOpen(false)}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            <Wrench className="h-4 w-4 shrink-0" aria-hidden="true" />
            Open a Tool
          </Link>
          <ul className="grid grid-cols-3 gap-1">
            {HEADER_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={resolveToolHref(link.href, navOrigin, homePath)}
                  aria-label={link.ariaLabel}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
