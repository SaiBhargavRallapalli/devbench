"use client";

import EngagementHero from "@/components/EngagementHero";
import ToolSearch from "@/components/ToolSearch";
import { TOOLS } from "@/lib/tools-registry";

/** Client wrapper for homepage engagement sections. */
export default function EngagementHome() {
  return (
    <>
      <EngagementHero />
      <ToolSearch tools={TOOLS} />
    </>
  );
}
