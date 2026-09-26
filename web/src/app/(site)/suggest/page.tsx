import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Suggest something" };

export default function SuggestPage() {
  return <ComingSoon title="Suggest something" phase="phase 5 (Forms)" />;
}
