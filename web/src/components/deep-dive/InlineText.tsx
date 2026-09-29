import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Body text with three bits of markup: `[label](href)` links, `**bold**` and
 * `==marker==` highlights.
 * Site paths and #anchors stay in the tab; other sites open in a new one.
 */
export function InlineText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|==([^=]+)==/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = m.index;
    if (m[3] !== undefined) {
      out.push(<strong key={key}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      out.push(<mark key={key}>{m[4]}</mark>);
    } else {
      const [, label, href] = m;
      if (href.startsWith("/")) {
        out.push(
          <Link key={key} href={href}>
            {label}
          </Link>,
        );
      } else if (href.startsWith("#")) {
        out.push(
          <a key={key} href={href}>
            {label}
          </a>,
        );
      } else {
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {label}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>,
        );
      }
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
