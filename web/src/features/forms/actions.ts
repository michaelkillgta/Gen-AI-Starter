"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";

/**
 * Form submissions. The browser posts to these server actions; they forward to
 * the Rust API server-side, so the API never has to be public and every form
 * works even before JavaScript loads.
 */

export type FormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Values to put back in the form after an error. */
  values?: Record<string, string>;
};

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8080";

type ApiAnswer = { ok: true; body: Record<string, unknown> } | { ok: false; state: FormState };

async function post(path: string, payload: Record<string, unknown>, values: Record<string, string>): Promise<ApiAnswer> {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { ok: false, state: { status: "error", message: "We couldn't reach the server. Please try again.", values } };
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.ok) return { ok: true, body };
  if (res.status === 429) {
    return { ok: false, state: { status: "error", message: "Too many tries. Please wait a minute and try again.", values } };
  }
  return {
    ok: false,
    state: {
      status: "error",
      message: typeof body.error === "string" ? body.error : "Something went wrong. Please try again.",
      fieldErrors: (body.fields as Record<string, string>) ?? undefined,
      values,
    },
  };
}

function fields(form: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((n) => [n, String(form.get(n) ?? "").trim()]));
}

const turnstile = (form: FormData) => String(form.get("cf-turnstile-response") ?? "");

// Honeypot: a hidden "website" field real people never fill in.
const isBot = (form: FormData) => String(form.get("website") ?? "") !== "";

export async function joinWaitlist(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["name", "phone", "email"]);
  if (isBot(form)) return { status: "ok" };
  const res = await post("/challenge/waitlist", { ...v, turnstile: turnstile(form) }, v);
  if (!res.ok) return res.state;
  updateTag("challenge"); // the live counter should include this signup straight away
  redirect(`/challenge/joined?n=${Number(res.body.position) || ""}`);
}

export async function subscribe(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["contact"]);
  if (isBot(form)) return { status: "ok", message: "You're subscribed." };
  const res = await post("/subscribe", { contact: v.contact, source: "blog", turnstile: turnstile(form) }, v);
  if (!res.ok) return res.state;
  return { status: "ok", message: "You're in. I'll send you a message when a new post goes live." };
}

export async function suggest(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["about", "title", "details", "link", "contact"]);
  if (isBot(form)) return { status: "ok" };
  const res = await post("/suggestions", { ...v, turnstile: turnstile(form) }, v);
  if (!res.ok) return res.state;
  return { status: "ok", message: "Thank you! I read every suggestion." };
}

export async function contact(_prev: FormState, form: FormData): Promise<FormState> {
  const v = fields(form, ["name", "email", "college", "message"]);
  if (isBot(form)) return { status: "ok" };
  const res = await post("/contact", { ...v, turnstile: turnstile(form) }, v);
  if (!res.ok) return res.state;
  return { status: "ok", message: "Thanks, your message is in. I'll reply by email." };
}
