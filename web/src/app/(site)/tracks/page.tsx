import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrackView } from "@/components/tracks/TrackView";
import { TracksIntro, WhereToStart } from "@/components/tracks/TracksIntro";
import { getTrack, getTracks } from "@/lib/api";
import { links } from "@/lib/links";

export const metadata: Metadata = {
  title: "Tracks",
  description: "Clear learning paths from your first AI call to agents and RAG, each deep dive ending with something you build.",
};

export default async function TracksPage() {
  const tracks = (await getTracks()) ?? [];
  // The flagship (dark) track is open by default, as in the design.
  const first = tracks.find((t) => t.tone === "dark") ?? tracks[0];
  const track = first ? await getTrack(first.slug) : null;

  return (
    <>
      <TracksIntro />
      {track && <TrackView tracks={tracks} track={track} />}
      <WhereToStart
        links={{
          foundations: links.track("foundations"),
          rag: links.track("rag-and-documents"),
          agents: links.track("agents-that-dont-break"),
        }}
      />
      <SiteFooter variant="slim" message={<>Every deep dive is also on the <Link href="/blog">Blog</Link>.</>} />
    </>
  );
}
