import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <ComingSoon title="About" phase="phase 4 (About and legal pages)" />;
}
