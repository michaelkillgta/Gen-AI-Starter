import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Blog" };

export default function BlogCategoryCategoryPage() {
  return <ComingSoon title="Blog" phase="phase 4 (Blog)" />;
}
