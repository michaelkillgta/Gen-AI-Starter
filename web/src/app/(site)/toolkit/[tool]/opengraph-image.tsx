import { getTool } from "@/lib/api";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "Field Tested toolkit entry";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const tool = await getTool((await params).tool);
  return ogCard({ eyebrow: "The toolkit", title: tool?.name ?? "Field Tested", sub: tool ? `Use it when: ${tool.use_when}` : undefined });
}
