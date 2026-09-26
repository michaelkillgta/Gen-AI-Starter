import { getDive } from "@/lib/api";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "Field Tested deep dive";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ dive: string }> }) {
  const dive = await getDive((await params).dive);
  return ogCard({
    dark: true,
    eyebrow: dive ? `${dive.track.name} · deep dive ${dive.position}` : "Deep dive",
    title: dive?.title ?? "Field Tested",
    sub: dive?.tldr[0],
  });
}
