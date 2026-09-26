"use client";

import { useActionState } from "react";

import { Button, TextArea, TextField } from "@/components/ui";
import { FormMessage, Honeypot, Turnstile } from "@/components/ui/FormBits";
import { contact, suggest, type FormState } from "@/features/forms/actions";
import styles from "./SimpleForms.module.css";

const initial: FormState = { status: "idle" };

const ABOUT = [
  { value: "tool", label: "A tool for the toolkit" },
  { value: "weekly", label: "Something for Worth It? Weekly" },
  { value: "topic", label: "A blog or deep dive topic" },
  { value: "fix", label: "A mistake to fix" },
  { value: "other", label: "Something else" },
];

export function SuggestForm({ about }: { about: string }) {
  const [state, action, pending] = useActionState(suggest, initial);
  const err = state.fieldErrors ?? {};

  if (state.status === "ok") {
    return (
      <div className={styles.done} role="status">
        <strong>{state.message}</strong>
        <span>If you left an email, I&apos;ll let you know when it&apos;s up.</span>
      </div>
    );
  }

  const selected = state.values?.about ?? (ABOUT.some((a) => a.value === about) ? about : "tool");
  return (
    <form action={action} className={styles.form} noValidate>
      <fieldset className={styles.choices}>
        <legend className={styles.legend}>What are you suggesting?</legend>
        {ABOUT.map((a) => (
          <label key={a.value} className={styles.choice}>
            <input type="radio" name="about" value={a.value} defaultChecked={a.value === selected} />
            {a.label}
          </label>
        ))}
      </fieldset>
      <TextField
        id="sg-title"
        name="title"
        label="Name of the tool or topic"
        placeholder="For example “Docling” or “How to evaluate RAG”"
        required
        defaultValue={state.values?.title}
        error={err.title}
      />
      <TextField
        id="sg-link"
        name="link"
        type="url"
        label="Link (optional)"
        placeholder="https://"
        defaultValue={state.values?.link}
        error={err.link}
      />
      <TextArea
        id="sg-details"
        name="details"
        label="Why should I look at it? (optional)"
        placeholder="What you'd use it for, or what confused you"
        defaultValue={state.values?.details}
        error={err.details}
      />
      <TextField
        id="sg-contact"
        name="contact"
        type="email"
        label="Your email (optional)"
        hint="Only if you'd like a reply."
        placeholder="you@example.com"
        autoComplete="email"
        defaultValue={state.values?.contact}
        error={err.contact}
      />
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
