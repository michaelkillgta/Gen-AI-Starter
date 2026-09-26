import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <ComingSoon title="Privacy" phase="phase 4 (About and legal pages)" />;
}
