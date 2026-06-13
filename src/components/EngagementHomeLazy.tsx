"use client";
import dynamic from "next/dynamic";

const EngagementHomeLazy = dynamic(() => import("@/components/EngagementHome"), {
  ssr: false,
  loading: () => <div className="min-h-[600px]" aria-hidden />,
});

export default EngagementHomeLazy;
