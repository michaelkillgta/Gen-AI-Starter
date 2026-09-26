import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <ComingSoon title="Contact" phase="phase 5 (Forms)" />;
}
