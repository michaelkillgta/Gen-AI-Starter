import Link from "next/link";

import { site } from "@/lib/site";
import styles from "./Logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label={`${site.name} home`}>
      <span className={styles.mark} aria-hidden="true">
        {/* Prompt spark: a prompt arrow, then the AI's answer. */}
        <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
          <path
            d="M6.75 10.5L12.25 16L6.75 21.5"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.75 10C21.35 14.5 22.25 15.4 26.75 16C22.25 16.6 21.35 17.5 20.75 22C20.15 17.5 19.25 16.6 14.75 16C19.25 15.4 20.15 14.5 20.75 10Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className={styles.word}>{site.name}</span>
    </Link>
  );
}
