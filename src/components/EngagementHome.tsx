"use client";

import EngagementHero from "@/components/EngagementHero";
import ToolSearch from "@/components/ToolSearch";
import type { Tool } from "@/lib/tools-registry";

/** Client wrapper for homepage engagement sections. */
export default function EngagementHome({ tools }: { tools: Tool[] }) {
  return (
    <>
      <EngagementHero />
      <ToolSearch tools={tools} />
    </>
  );
}
