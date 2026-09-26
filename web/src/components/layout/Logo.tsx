import Link from "next/link";

import { site } from "@/lib/site";
import styles from "./Logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label={`${site.name} home`}>
      <span className={styles.mark} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5l2.8 2.8L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.word}>{site.name}</span>
    </Link>
  );
}
