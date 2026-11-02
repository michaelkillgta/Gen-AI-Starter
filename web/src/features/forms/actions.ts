"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";

import { visitorIp } from "@/features/admin/server";
import * as forms from "@/server/forms";

/**
 * Form submissions. The browser posts to these server actions, which check and
 * store them (src/server/forms.ts), so every form works even before JavaScript loads.
 */

export type FormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Values to put back in the form after an error. */
  values?: Record<string, string>;
};

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;

/** Cloudflare Turnstile check. Off when TURNSTILE_SECRET is unset (local development). */
async function humanCheck(form: FormData, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true;
  const token = String(form.get("cf-turnstile-response") ?? "");
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
      cache: "no-store",
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

type Answer<T> = { ok: true; value: T } | { ok: false; state: FormState };

/** Bot check, then the form's own rules; turns problems into what the form shows. */
async function submit<T>(
  form: FormData,
  values: Record<string, string>,
  run: (ip: string) => Promise<forms.FormResult<T>>,
): Promise<Answer<T>> {
  const ip = await visitorIp();
  if (!(await humanCheck(form, ip))) {
    return { ok: false, state: { status: "error", message: "Please complete the check that you're not a robot.", values } };
  }
  let res: forms.FormResult<T>;
  try {
    res = await run(ip);
  } catch (e) {
    console.error("form:", e);
    return { ok: false, state: { status: "error", message: "Something went wrong on our side. Please try again.", values } };
  }
  if (res.ok) return res;
  if (res.reason === "too-many") {
    return { ok: false, state: { status: "error", message: "Too many tries. Please wait a minute and try again.", values } };
  }
  return { ok: false, state: { status: "error", message: "Please check the highlighted fields.", fieldErrors: res.fields, values } };
}

function fields(form: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((n) => [n, String(form.get(n) ?? "").trim()]));
}

// Honeypot: a hidden "website" field real people never fill in.
const isBot = (form: FormData) => String(form.get("website") ?? "") !== "";

export async function joinWaitlist(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["name", "phone", "email"]);
  if (isBot(form)) return { status: "ok" };
  const res = await submit(form, v, (ip) => forms.joinWaitlist(ip, { name: v.name, phone: v.phone, email: v.email }));
  if (!res.ok) return res.state;
  updateTag("challenge"); // the live counter should include this signup straight away
  redirect(`/challenge/joined?n=${res.value.position || ""}`);
}

export async function subscribe(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["contact"]);
  if (isBot(form)) return { status: "ok", message: "You're subscribed." };
  const res = await submit(form, v, (ip) => forms.subscribe(ip, { contact: v.contact, source: "blog" }));
  if (!res.ok) return res.state;
  return { status: "ok", message: "You're in. I'll send you a message when a new post goes live." };
}

export async function suggest(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["about", "title", "details", "link", "contact"]);
  if (isBot(form)) return { status: "ok" };
  const res = await submit(form, v, (ip) =>
    forms.suggest(ip, { about: v.about, title: v.title, details: v.details, link: v.link, contact: v.contact }),
  );
  if (!res.ok) return res.state;
  return { status: "ok", message: "Thank you! I read every suggestion." };
}

export async function contact(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["name", "email", "college", "message"]);
  if (isBot(form)) return { status: "ok" };
  const res = await submit(form, v, (ip) =>
    forms.contact(ip, { name: v.name, email: v.email, college: v.college, message: v.message }),
  );
  if (!res.ok) return res.state;
  return { status: "ok", message: "Thanks, your message is in. I'll reply by email." };
}
