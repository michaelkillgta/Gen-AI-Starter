import { getTool } from "@/lib/api";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "GenAI Starter toolkit entry";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const tool = await getTool((await params).tool);
  return ogCard({ eyebrow: "The toolkit", title: tool?.name ?? "GenAI Starter", sub: tool ? `Use it when: ${tool.use_when}` : undefined });
}
