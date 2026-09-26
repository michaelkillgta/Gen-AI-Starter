"use client";

import Script from "next/script";

import styles from "./FormBits.module.css";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/**
 * Cloudflare Turnstile bot check. Only shown when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set (in production); local development skips it.
 */
export function Turnstile() {
  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" data-size="flexible" />
    </>
  );
}

/** Success or error line under a form. Announced to screen readers. */
export function FormMessage({ status, message }: { status: "idle" | "ok" | "error"; message?: string }) {
  if (status === "idle" || !message) return <span role="status" aria-live="polite" />;
  return (
    <span role={status === "error" ? "alert" : "status"} className={status === "error" ? styles.error : styles.ok}>
      {message}
    </span>
  );
}
