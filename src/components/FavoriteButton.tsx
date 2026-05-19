"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getFavoriteSlugs, toggleFavorite } from "@/lib/devbench-preferences";

export default function FavoriteButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function sync() {
      setActive(getFavoriteSlugs().includes(slug));
    }
    sync();
    window.addEventListener("devbench:prefs-changed", sync);
    return () => window.removeEventListener("devbench:prefs-changed", sync);
  }, [slug]);

  return (
    <button
      type="button"
      onClick={() => setActive(toggleFavorite(slug))}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors hover:bg-muted ${
        active ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-foreground"
      } ${className}`}
      aria-pressed={active}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={`w-3.5 h-3.5 ${active ? "fill-current" : ""}`} aria-hidden />
      {active ? "Favorited" : "Favorite"}
    </button>
  );
}
