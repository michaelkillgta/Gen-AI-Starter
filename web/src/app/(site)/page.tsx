import { PromoCards } from "@/components/home/PromoCards";
import { ThisWeek, type ThisWeekItem } from "@/components/home/ThisWeek";
import { TrustLine } from "@/components/home/TrustLine";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeExplorer } from "@/components/toolkit/HomeExplorer";
import { getChallenge, getLatestIssue, getPosts, getTools, getTracks, getTrack } from "@/lib/api";
import { links } from "@/lib/links";

export default async function HomePage() {
  const [toolkit, issue, challenge, tracks, blog] = await Promise.all([
    getTools(),
    getLatestIssue(),
    getChallenge(),
    getTracks(),
    getPosts(),
  ]);

  // "New deep dive": the first dive with a full write-up in the flagship track.
  const flagship = tracks?.find((t) => t.tone === "dark") ?? tracks?.[0];
  const flagshipDetail = flagship ? await getTrack(flagship.slug) : null;
  const newest = flagshipDetail?.dives.find((d) => d.has_body) ?? flagshipDetail?.dives[0];

  const items: ThisWeekItem[] = [];
  // Newest blog post first: posts come newest first.
  const latestPost = blog?.posts[0];
  if (latestPost) {
    items.push({
      href: links.post(latestPost.slug),
      eyebrow: "New on the blog",
      text: latestPost.title,
      tone: "rose",
      icon: "pen",
    });
  }
  if (issue) {
    const n = issue.verdicts.length;
    items.push({
      href: "/weekly",
      eyebrow: "Worth It? Weekly",
      text: `${n} tools judged: ${issue.tally.use} use, ${issue.tally.wait} wait, ${issue.tally.skip} skip`,
      tone: "green",
      icon: "check",
    });
  }
  if (challenge) {
    items.push({
      href: "/challenge",
      eyebrow: "Build challenge",
      text: `One real AI project in a day. ${challenge.challenge.status === "waitlist" ? "Waitlist open" : "Details inside"}`,
      tone: "amber",
      icon: "bolt",
    });
  }
  if (flagship && newest) {
    items.push({
      href: links.dive(flagship.slug, newest.slug),
      eyebrow: "New deep dive",
      text: newest.title,
      tone: "clay",
      icon: "book",
    });
  }

  return (
    <>
      <HomeExplorer
        tools={toolkit?.tools ?? []}
        startLists={toolkit?.start_lists ?? []}
        thisWeek={<ThisWeek items={items} />}
      />
      <PromoCards />
      <TrustLine />
      <SiteFooter variant="full" />
    </>
  );
}
