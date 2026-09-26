import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Weekly issue" };

export default function WeeklyIssuePage() {
  return <ComingSoon title="Weekly issue" phase="phase 4 (Weekly)" />;
}
