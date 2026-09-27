"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";

import { Button, ProgressBar, TextField } from "@/components/ui";
import { FormMessage, Honeypot, Turnstile } from "@/components/ui/FormBits";
import { waitlistStatus } from "@/features/challenge/status";
import { joinWaitlist, type FormState } from "@/features/forms/actions";
import styles from "./Challenge.module.css";
import { focusWaitlist, WAITLIST_ID } from "./waitlist-anchor";

const initial: FormState = { status: "idle" };

/** Name, WhatsApp and email, plus the live "N of 50 joined" counter. */
export function WaitlistForm({ joined, goal }: { joined: number; goal: number }) {
  const [state, action, pending] = useActionState(joinWaitlist, initial);
  const err = state.fieldErrors ?? {};

  // Arriving from a "Build with us, free" link (/challenge#waitlist): start in the name field.
  useEffect(() => {
    if (window.location.hash === `#${WAITLIST_ID}`) focusWaitlist();
  }, []);

  return (
    <form id={WAITLIST_ID} action={action} className={styles.form} noValidate aria-labelledby="waitlist-title">
      <div className={styles.formHead}>
        <h2 id="waitlist-title" className={styles.formTitle}>
          Join the waitlist
        </h2>
        <p className={styles.formLead}>When we reach {goal}, you&apos;ll get a personal invite with the date and timings.</p>
      </div>
      <TextField
        id="ch-name"
        name="name"
        label="Your name"
        placeholder="Your full name"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        error={err.name}
      />
      <TextField
        id="ch-phone"
        name="phone"
        type="tel"
        label="WhatsApp number"
        placeholder="+91"
        autoComplete="tel"
        inputMode="tel"
        required
        defaultValue={state.values?.phone}
        error={err.phone}
      />
      <TextField
        id="ch-email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={err.email}
      />
      <Honeypot />
      <Turnstile />
      <Button type="submit" variant="accent" size="lg" block disabled={pending}>
        {pending ? "Joining…" : "Join the waitlist"}
      </Button>
      <FormMessage status={state.status} message={state.fieldErrors ? undefined : state.message} />
      <div className={styles.counter}>
        <div className={styles.counterHead}>
          <span>
            <strong>
              {joined} of {goal}
            </strong>{" "}
            <span className={styles.muted}>people have joined</span>
          </span>
          <span className={styles.counterStatus}>{waitlistStatus(joined, goal)}</span>
        </div>
        <ProgressBar value={joined} max={goal} label="Waitlist progress" />
      </div>
      <p className={styles.privacyNote}>
        Your number and email are only used for this challenge. See the <Link href="/privacy">privacy note</Link>.
      </p>
    </form>
  );
}
