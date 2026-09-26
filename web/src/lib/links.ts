/** Web addresses for content, in one place so pages and components agree. */
export const links = {
  tool: (slug: string) => `/toolkit/${slug}`,
  track: (slug: string) => `/tracks/${slug}`,
  dive: (track: string, slug: string) => `/tracks/${track}/${slug}`,
  issue: (n: number) => `/weekly/${n}`,
  post: (slug: string) => `/blog/${slug}`,
  category: (slug: string) => `/blog/category/${slug}`,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-21" → "21 Sep 2026". Done by hand so server and browser always agree. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}
