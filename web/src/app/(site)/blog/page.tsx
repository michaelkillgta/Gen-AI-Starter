import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return <ComingSoon title="Blog" lead="My honest perspective on AI." phase="phase 4 (Blog)" />;
}
