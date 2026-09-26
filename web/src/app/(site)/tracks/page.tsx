import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Tracks" };

export default function TracksPage() {
  return <ComingSoon title="Tracks" lead="Clear paths, so you always know what comes next." phase="phase 4 (Tracks + Deep dive)" />;
}
