import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Worth It? Weekly" };

export default function WeeklyPage() {
  return <ComingSoon title="Worth It? Weekly" lead="Five new AI tools every week: use it, wait, or skip." phase="phase 4 (Weekly)" />;
}
