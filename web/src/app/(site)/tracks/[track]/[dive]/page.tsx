import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Deep dive" };

export default function TracksTrackDivePage() {
  return <ComingSoon title="Deep dive" phase="phase 4 (Tracks + Deep dive)" />;
}
