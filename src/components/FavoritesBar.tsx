"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { getFavoriteSlugs, getToolHistory } from "@/lib/devbench-preferences";
import { getToolBySlug } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";

export default function FavoritesBar() {
  const [favSlugs, setFavSlugs] = useState<string[]>([]);
  const [history, setHistory] = useState<ReturnType<typeof getToolHistory>>([]);

  useEffect(() => {
    function sync() {
      setFavSlugs(getFavoriteSlugs());
      setHistory(getToolHistory().slice(0, 5));
    }
    sync();
    window.addEventListener("devbench:prefs-changed", sync);
    return () => window.removeEventListener("devbench:prefs-changed", sync);
  }, []);

  if (!favSlugs.length && !history.length) return null;

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {favSlugs.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Star className="w-3 h-3 text-amber-500 shrink-0" aria-hidden />
            <span className="text-muted-foreground font-medium">Shortcuts:</span>
            {favSlugs.map((slug) => {
              const t = getToolBySlug(slug);
              if (!t) return null;
              return (
                <Link
                  key={slug}
                  href={publicHrefForToolSlug(slug)}
                  className="rounded-md px-2 py-0.5 hover:bg-muted text-foreground"
                >
                  {t.shortName}
                </Link>
              );
            })}
          </div>
        )}
        {history.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Clock className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
            <span className="text-muted-foreground font-medium">Recent:</span>
            {history.map((h) => (
              <Link
                key={`${h.slug}-${h.at}`}
                href={h.href}
                className="rounded-md px-2 py-0.5 hover:bg-muted text-foreground"
              >
                {h.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
