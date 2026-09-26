import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui";
import styles from "./status-page.module.css";

export default function NotFound() {
  return (
    <div className={styles.shell}>
      <SiteHeader />
      <main id="main" className={`container ${styles.body}`}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>This page doesn&apos;t exist.</h1>
        <p className={styles.text}>The link may be old, or the page moved. Try the toolkit, or start from the homepage.</p>
        <div className={styles.actions}>
          <Button href="/">Go to the homepage</Button>
          <Button href="/toolkit" variant="light">
            Browse the toolkit
          </Button>
        </div>
      </main>
      <SiteFooter variant="slim" message={<>Think something is missing? <a href="/suggest">Tell me</a></>} />
    </div>
  );
}
