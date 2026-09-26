import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrackView } from "@/components/tracks/TrackView";
import { TracksIntro, WhereToStart } from "@/components/tracks/TracksIntro";
import { getTrack, getTracks } from "@/lib/api";
import { links } from "@/lib/links";

type Props = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const track = await getTrack((await params).track);
  if (!track) return { title: "Track not found" };
  return { title: `${track.name} track`, description: track.blurb };
}

export default async function TrackPage({ params }: Props) {
  const [tracks, track] = await Promise.all([getTracks(), getTrack((await params).track)]);
  if (!track || !tracks) notFound();

  return (
    <>
      <TracksIntro />
      <TrackView tracks={tracks} track={track} />
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
