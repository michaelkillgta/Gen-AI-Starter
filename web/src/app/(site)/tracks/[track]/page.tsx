import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { Roadmap, TrackTabs } from "@/components/tracks/Roadmap";
import { TracksIntro, WhereToStart } from "@/components/tracks/TracksIntro";
import { getTrack, getTracks } from "@/lib/api";

type Props = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const track = await getTrack((await params).track);
  if (!track) return { title: "Track not found" };
  return { title: `${track.name}: step-by-step plan`, description: track.blurb };
}

export default async function TrackPage({ params }: Props) {
  const [tracks, track] = await Promise.all([getTracks(), getTrack((await params).track)]);
  if (!track || !tracks) notFound();

  return (
    <>
      <TracksIntro />
      <TrackTabs tracks={tracks} current={track.slug} />
      <Roadmap track={track} />
      <WhereToStart />
      <SiteFooter
        variant="slim"
        message={
          <>
            Know a great free resource I missed? <Link href="/suggest?about=topic">Suggest it</Link>
          </>
        }
      />
    </>
  );
}
