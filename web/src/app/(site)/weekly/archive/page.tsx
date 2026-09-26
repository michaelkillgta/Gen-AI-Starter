import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Past weeks" };

export default function WeeklyArchivePage() {
  return <ComingSoon title="Past weeks" phase="phase 4 (Weekly)" />;
}
