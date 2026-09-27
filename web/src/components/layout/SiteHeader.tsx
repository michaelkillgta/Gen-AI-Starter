"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActive, mainNav } from "@/lib/site";
import { Logo } from "./Logo";
import styles from "./SiteHeader.module.css";

/**
 * Desktop (1024px+): logo, full menu and a call-to-action button in one 76px bar.
 * Phone and tablet: logo bar, then a row of pills that scrolls sideways.
 */
export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  // The button invites people to the free build challenge; on the challenge pages
  // themselves it points to this week's verdicts instead of the page you're on.
  const cta = isActive(pathname, "/challenge")
    ? { href: "/weekly", label: "This week's verdicts" }
    : { href: "/challenge", label: "Build with us, free" };

  return (
    <header className={styles.header}>
      <div className={styles.barWrap}>
      <div className={`container ${styles.bar}`}>
        <Logo />
        <nav aria-label="Main" className={styles.menu}>
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href={cta.href} className={styles.cta}>
          {cta.label}
        </Link>
      </div>
      </div>

      <nav aria-label="Main" className={styles.pills}>
        <div className={styles.pillTrack}>
          {[{ href: "/", label: "Home" }, ...mainNav].map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active ? `${styles.pill} ${styles.pillActive}` : styles.pill}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
