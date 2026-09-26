"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui";
import styles from "./status-page.module.css";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.shell}>
      <SiteHeader />
    <main id="main" className={`container ${styles.body}`}>
      <span className={styles.code}>Something broke</span>
      <h1 className={styles.title}>Sorry, this page didn&apos;t load.</h1>
      <p className={styles.text}>It&apos;s on our side, not yours. Try again in a moment.</p>
      <div className={styles.actions}>
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="light">
          Go to the homepage
        </Button>
      </div>
    </main>
    </div>
  );
}
