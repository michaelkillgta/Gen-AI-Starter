import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrackCards, TracksIntro, WhereToStart } from "@/components/tracks/TracksIntro";
import { getTracks } from "@/lib/api";

export const metadata: Metadata = {
  title: "Tracks",
  description:
    "Two step-by-step plans, AI/ML and Gen AI, with the best resources for every stage, a project to build and a checklist.",
};

export default async function TracksPage() {
  const tracks = (await getTracks()) ?? [];
  return (
    <>
      <TracksIntro />
      <TrackCards tracks={tracks} />
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
