import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "You're on the list." };

export default function ChallengeJoinedPage() {
  return <ComingSoon title="You're on the list." phase="phase 5 (Forms)" />;
}
