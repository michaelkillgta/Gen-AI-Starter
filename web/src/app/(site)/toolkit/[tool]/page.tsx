import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Tool" };

export default function ToolkitToolPage() {
  return <ComingSoon title="Tool" phase="phase 4 (Home + Toolkit)" />;
}
