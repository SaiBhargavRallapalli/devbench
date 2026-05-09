import { WifiOff, Wifi } from "lucide-react";
import { getToolConnectivity } from "@/lib/tool-connectivity";

export default function ToolConnectivityBadge({ slug }: { slug: string }) {
  const c = getToolConnectivity(slug);
  if (c.mode === "offline") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <WifiOff className="h-3 w-3 shrink-0" aria-hidden />
        Offline-ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
      <Wifi className="h-3 w-3 shrink-0" aria-hidden />
      Needs internet · {c.detail}
    </span>
  );
}
