"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button, TextArea, TextField } from "@/components/ui";
import { FormMessage, Honeypot, Turnstile } from "@/components/ui/FormBits";
import { contact, suggest, type FormState } from "@/features/forms/actions";
import styles from "./SimpleForms.module.css";

const initial: FormState = { status: "idle" };

type About = "tool" | "weekly" | "topic" | "fix" | "other";

/** Each choice gets its own wording, so the form always asks the right question. */
const ABOUT: {
  value: About;
  label: string;
  hint: string;
  title: [string, string];
  link: [string, string];
  details: [string, string];
}[] = [
  {
    value: "tool",
    label: "A tool for the toolkit",
    hint: "An app, library, package or MCP server",
    title: ["Tool name", "For example “Docling”, “n8n” or “Context7 MCP”"],
    link: ["Website or GitHub link (optional)", "https://"],
    details: ["What would you use it for? (optional)", "The project you'd build with it, or why it caught your eye"],
  },
  {
    value: "weekly",
    label: "Something to judge in Weekly",
    hint: "New and everyone's talking about it",
    title: ["What should I judge?", "A new tool, library or repo"],
    link: ["Where did you see it? (optional)", "https://"],
    details: ["What do you want to know? (optional)", "Is it worth learning? Does it run on a normal laptop?"],
  },
  {
    value: "topic",
    label: "A topic to explain",
    hint: "For the blog or a deep dive",
    title: ["Topic", "For example “How to test a RAG app”"],
    link: ["A link about it (optional)", "https://"],
    details: ["What's confusing about it? (optional)", "What you've tried, and where you got stuck"],
  },
  {
    value: "fix",
    label: "A mistake to fix",
    hint: "Something wrong or out of date",
    title: ["Where is it?", "The page or tool name"],
    link: ["Link to the page (optional)", "https://"],
    details: ["What's wrong? (optional)", "What it says now, and what it should say"],
  },
  {
    value: "other",
    label: "Something else",
    hint: "Ideas, feedback, anything",
    title: ["What's it about?", "One line is enough"],
    link: ["Link (optional)", "https://"],
    details: ["Tell me more (optional)", ""],
  },
];

const isAbout = (v: string | undefined): v is About => ABOUT.some((a) => a.value === v);

export function SuggestForm({ about }: { about: string }) {
  const [state, action, pending] = useActionState(suggest, initial);
  const [choice, setChoice] = useState<About>(isAbout(about) ? about : "tool");
  const err = state.fieldErrors ?? {};
  const copy = ABOUT.find((a) => a.value === choice) ?? ABOUT[0];

  if (state.status === "ok") {
    return (
      <div className={styles.done} role="status">
        <span className={styles.doneCheck} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.2l2 2L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <strong>{state.message}</strong>
        <span>If you left an email, I&apos;ll let you know when it&apos;s up.</span>
        <div className={styles.doneLinks}>
          <Link href="/weekly">See this week&apos;s verdicts</Link>
          <Link href="/toolkit">Back to the toolkit</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form} noValidate>
      <fieldset className={styles.choices}>
        <legend className={styles.legend}>What are you suggesting?</legend>
        <div className={styles.tiles}>
          {ABOUT.map((a) => (
            <label key={a.value} className={a.value === choice ? `${styles.tile} ${styles.tileOn}` : styles.tile}>
              <input
                type="radio"
                name="about"
                value={a.value}
                checked={a.value === choice}
                onChange={() => setChoice(a.value)}
                className={styles.tileRadio}
              />
              <span className={styles.tileLabel}>{a.label}</span>
              <span className={styles.tileHint}>{a.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.fields}>
        <TextField
          id="sg-title"
          name="title"
          label={copy.title[0]}
          placeholder={copy.title[1]}
          required
          defaultValue={state.values?.title}
          error={err.title}
        />
        <TextArea
          id="sg-details"
          name="details"
          label={copy.details[0]}
          placeholder={copy.details[1]}
          rows={4}
          defaultValue={state.values?.details}
          error={err.details}
        />
        <TextField
          id="sg-link"
          name="link"
          type="url"
          inputMode="url"
          label={copy.link[0]}
          placeholder={copy.link[1]}
          defaultValue={state.values?.link}
          error={err.link}
        />
        <TextField
          id="sg-contact"
          name="contact"
          type="email"
          label="Your email (optional)"
          hint="Only if you'd like to hear back. Never shared."
          placeholder="you@example.com"
          autoComplete="email"
          defaultValue={state.values?.contact}
          error={err.contact}
        />
      </div>
      <Honeypot />
      <Turnstile />
      <div className={styles.actions}>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send suggestion"}
        </Button>
        <FormMessage status={state.status} message={state.fieldErrors ? undefined : state.message} />
      </div>
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(contact, initial);
  const err = state.fieldErrors ?? {};

  if (state.status === "ok") {
    return (
      <div className={styles.done} role="status">
        <strong>{state.message}</strong>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form} noValidate>
      <TextField id="ct-name" name="name" label="Your name" autoComplete="name" required defaultValue={state.values?.name} error={err.name} />
      <TextField
        id="ct-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        defaultValue={state.values?.email}
        error={err.email}
      />
      <TextField
        id="ct-college"
        name="college"
        label="College or company (optional)"
        autoComplete="organization"
        defaultValue={state.values?.college}
        error={err.college}
      />
      <TextArea
        id="ct-message"
        name="message"
        label="Message"
        required
        placeholder="Running the build challenge at your college, a question, or a correction"
        defaultValue={state.values?.message}
        error={err.message}
      />
      <Honeypot />
      <Turnstile />
      <div className={styles.actions}>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
        <FormMessage status={state.status} message={state.fieldErrors ? undefined : state.message} />
      </div>
    </form>
  );
}
