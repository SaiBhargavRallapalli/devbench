// Copyright (c) 2026 DevBench contributors. MIT License.
import { Server, Globe, Sparkles, Wrench } from "lucide-react";
import AffiliateLink from "@/components/AffiliateLink";
import {
  AFFILIATE_DISCLOSURE,
  getAffiliatePrograms,
  type AffiliateCategory,
} from "@/lib/affiliates";

const CATEGORY_META: Record<AffiliateCategory, { label: string; icon: typeof Server }> = {
  hosting: { label: "Hosting", icon: Server },
  domains: { label: "Domains", icon: Globe },
  tooling: { label: "Tooling", icon: Wrench },
  learning: { label: "Learning", icon: Sparkles },
};

/**
 * "Recommended for developers" — editorial affiliate placements.
 *
 * Deliberately styled as a recommendation card, not an ad slot: contextual
 * affiliate links convert far better than display ads for a technical
 * audience, and they don't compete with the Core Web Vitals budget the way
 * injected ad iframes do. The FTC disclosure sits directly above the links.
 */
export default function AffiliateRecommendations({
  className,
}: {
  className?: string;
}) {
  const programs = getAffiliatePrograms();
  if (programs.length === 0) return null;

  return (
    <section
      aria-labelledby="affiliate-recommendations-heading"
      className={className}
    >
      <h2
        id="affiliate-recommendations-heading"
        className="text-sm font-semibold tracking-tight text-foreground"
      >
        Recommended for developers
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{AFFILIATE_DISCLOSURE}</p>

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {programs.map((program) => {
          const meta = CATEGORY_META[program.category];
          const Icon = meta.icon;
          return (
            <li
              key={program.id}
              className="rounded-2xl border border-border/70 bg-card/50 px-4 py-3.5 shadow-sm shadow-black/[0.03] transition-colors hover:border-accent/50"
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-lg bg-accent/10 p-1.5">
                  <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                </span>
                <AffiliateLink
                  program={program}
                  className="text-sm font-semibold text-foreground hover:text-accent transition-colors"
                >
                  {program.name}
                </AffiliateLink>
                <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {meta.label}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {program.blurb}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
