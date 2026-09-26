import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "The toolkit." };

export default function ToolkitPage() {
  return <ComingSoon title="The toolkit." lead="Tools, libraries, packages and MCP servers, explained in plain words." phase="phase 4 (Home + Toolkit)" />;
}
