"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui";
import { FormMessage, Honeypot, Turnstile } from "@/components/ui/FormBits";
import { subscribe, type FormState } from "@/features/forms/actions";
import styles from "./SubscribeBox.module.css";

const initial: FormState = { status: "idle" };

/** "Get new posts on WhatsApp" signup under the blog. */
export function SubscribeBox() {
  const [state, action, pending] = useActionState(subscribe, initial);

  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="subscribe-title">
      <div className={styles.box}>
        <div className={styles.text}>
          <h2 id="subscribe-title" className={styles.title}>
            Get new posts on WhatsApp.
          </h2>
          <p className={styles.lead}>One message when a new post goes live. No spam.</p>
        </div>
        {state.status === "ok" ? (
          <FormMessage status="ok" message={state.message} />
        ) : (
          <form action={action} className={styles.form} noValidate>
            <label htmlFor="blog-sub" className={styles.label}>
              WhatsApp number or email
            </label>
            <div className={styles.row}>
              <input
                id="blog-sub"
                name="contact"
                type="text"
                inputMode="email"
                autoComplete="email"
                required
                defaultValue={state.values?.contact}
                aria-invalid={state.status === "error" ? true : undefined}
                aria-describedby="blog-sub-msg"
                placeholder="So I can send you new posts"
                className={styles.input}
              />
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Subscribing…" : "Subscribe"}
              </Button>
            </div>
            <Honeypot />
            <Turnstile />
            <span id="blog-sub-msg">
              <FormMessage status={state.status} message={state.fieldErrors?.contact ?? state.message} />
            </span>
          </form>
        )}
      </div>
    </section>
  );
}
