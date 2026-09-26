import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Build challenge" };

export default function ChallengePage() {
  return <ComingSoon title="Build challenge" lead="Build one real AI project this weekend." phase="phase 4 (Challenge)" />;
}
