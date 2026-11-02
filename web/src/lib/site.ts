/**
 * Site-wide settings. Values marked TODO(uma) are placeholders from the design
 * that Uma fills in before launch; everything that reads them goes through here.
 */
export const site = {
  name: "GenAI Starter",
  tagline: "Find the right AI tool, explained simply.",
  description:
    "What each AI tool does, when to use it, and when to skip it. Made for freshers and students in India.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    name: "Uma",
    initial: "U",
    role: "AI lead who builds AI agents",
  },
  // TODO(uma): real links. Kept as "#" until they exist.
  social: {
    youtube: "#",
    linkedin: "#",
    whatsappChannel: "#",
    github: "#",
  },
  // TODO(uma): update whenever the toolkit is reviewed (shown under the toolkit title).
  toolkitReviewed: "2026-09-26",
  // TODO(uma): values shown on the Weekly and Challenge pages.
  placeholders: {
    weeklyDay: "[DAY]",
  },
} as const;

export type NavItem = { href: string; label: string };

/** Main navigation, in design order. Home is only shown in the pill nav. */
export const mainNav: NavItem[] = [
  { href: "/toolkit", label: "Toolkit" },
  { href: "/tracks", label: "Tracks" },
  { href: "/weekly", label: "Worth It? Weekly" },
  { href: "/challenge", label: "Build challenge" },
  { href: "/blog", label: "Blog" },
  { href: "/python", label: "Python" },
];

export const footerNav = {
  learn: mainNav,
  follow: [
    { href: site.social.youtube, label: "YouTube" },
    { href: site.social.linkedin, label: "LinkedIn" },
    { href: site.social.whatsappChannel, label: "WhatsApp channel" },
    { href: site.social.github, label: "GitHub" },
  ],
  about: [
    { href: "/about", label: "About" },
    { href: "/suggest", label: "Suggest a tool" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

/** Is `href` the current section? Deep dives live under /tracks, so they light up Tracks. */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
