import "server-only";

import { randomUUID } from "node:crypto";

import { currentChallenge, waitlistCount } from "./content";
import { db } from "./db";
import * as validate from "./validate";
import { FieldError } from "./validate";

/**
 * Form rules: rate limit, validation, then storage. (The Cloudflare Turnstile bot
 * check and the honeypot happen first, in features/forms/actions.ts.)
 */

export type FormResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: "invalid"; fields: Record<string, string> }
  | { ok: false; reason: "too-many" };

/** Form posts allowed per visitor per minute. */
const POSTS_PER_MINUTE = Number(process.env.FORM_POSTS_PER_MINUTE ?? 6);

/** Records a form post from `ip` and says whether it is allowed. */
async function allowed(ip: string): Promise<boolean> {
  const sql = db();
  // Old hits are forgotten as we go, so the table stays tiny.
  await sql`DELETE FROM form_hits WHERE at < now() - interval '1 minute'`;
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM form_hits WHERE ip = ${ip}`;
  if (n >= POSTS_PER_MINUTE) return false;
  await sql`INSERT INTO form_hits (ip) VALUES (${ip})`;
  return true;
}

/** Collects field errors so the form can show all of them at once. */
class Fields {
  errors: Record<string, string> = {};

  take<T>(field: string, check: () => T): T | undefined {
    try {
      return check();
    } catch (e) {
      if (!(e instanceof FieldError)) throw e;
      this.errors[field] = e.message;
      return undefined;
    }
  }

  get ok() {
    return Object.keys(this.errors).length === 0;
  }
}

const invalid = (fields: Record<string, string>) => ({ ok: false, reason: "invalid", fields }) as const;
const tooMany = { ok: false, reason: "too-many" } as const;

export type WaitlistAnswer = { position: number; joined: number; goal: number; already_joined: boolean };

export async function joinWaitlist(
  ip: string,
  req: { name: string; phone: string; email: string },
): Promise<FormResult<WaitlistAnswer>> {
  if (!(await allowed(ip))) return tooMany;
  const f = new Fields();
  const name = f.take("name", () => validate.name(req.name));
  const phone = f.take("phone", () => validate.phone(req.phone));
  const email = f.take("email", () => validate.email(req.email));
  if (!f.ok) return invalid(f.errors);

  const challenge = await currentChallenge();
  const outcome = await db().begin(async (sql) => {
    // One signup at a time per challenge, so positions never collide.
    await sql`SELECT pg_advisory_xact_lock(hashtext(${challenge.slug}))`;
    const [dup] = await sql`
      SELECT position FROM waitlist_signups
      WHERE challenge_slug = ${challenge.slug} AND (phone = ${phone!} OR email = ${email!})
      ORDER BY position LIMIT 1`;
    if (dup) return { position: dup.position as number, duplicate: true };
    const [row] = await sql`
      INSERT INTO waitlist_signups (id, challenge_slug, position, name, phone, email)
      VALUES (${randomUUID()}, ${challenge.slug},
              (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist_signups WHERE challenge_slug = ${challenge.slug}),
              ${name!}, ${phone!}, ${email!})
      RETURNING position`;
    return { position: row.position as number, duplicate: false };
  });
  return {
    ok: true,
    value: {
      position: outcome.position,
      joined: await waitlistCount(challenge.slug),
      goal: challenge.goal,
      already_joined: outcome.duplicate,
    },
  };
}

export async function subscribe(ip: string, req: { contact: string; source: string }): Promise<FormResult<null>> {
  if (!(await allowed(ip))) return tooMany;
  const raw = req.contact.trim();
  const kind = raw.includes("@") ? "email" : "phone";
  let value: string;
  try {
    value = kind === "email" ? validate.email(raw) : validate.phone(raw);
  } catch {
    return invalid({ contact: "Enter a WhatsApp number (like 98765 43210) or an email." });
  }
  let source = "";
  try {
    source = validate.text(req.source, 40, "bad source");
  } catch {}
  // Already subscribed is fine: same friendly answer, no duplicate row.
  await db()`
    INSERT INTO subscribers (id, kind, value, source) VALUES (${randomUUID()}, ${kind}, ${value}, ${source})
    ON CONFLICT (value) DO NOTHING`;
  return { ok: true, value: null };
}

const ABOUT = new Set(["tool", "weekly", "topic", "fix", "other"]);

export async function suggest(
  ip: string,
  req: { about: string; title: string; details: string; link: string; contact: string },
): Promise<FormResult<null>> {
  if (!(await allowed(ip))) return tooMany;
  const f = new Fields();
  const about = ABOUT.has(req.about) ? req.about : "other";
  const title = f.take("title", () => validate.text(req.title, 120, "Please keep this under 120 characters."));
  if (title === "") f.errors.title = "Please tell me the name of the tool or topic.";
  const details = f.take("details", () => validate.text(req.details, 2000, "Please keep this under 2000 characters."));
  const link = f.take("link", () => validate.url(req.link));
  const contact = req.contact.trim() ? f.take("contact", () => validate.email(req.contact)) : "";
  if (!f.ok) return invalid(f.errors);
  await db()`
    INSERT INTO suggestions (id, about, title, details, link, contact)
    VALUES (${randomUUID()}, ${about}, ${title!}, ${details!}, ${link!}, ${contact!})`;
  return { ok: true, value: null };
}

export async function contact(
  ip: string,
  req: { name: string; email: string; college: string; message: string },
): Promise<FormResult<null>> {
  if (!(await allowed(ip))) return tooMany;
  const f = new Fields();
  const name = f.take("name", () => validate.name(req.name));
  const email = f.take("email", () => validate.email(req.email));
  const college = f.take("college", () => validate.text(req.college, 120, "Please keep this under 120 characters."));
  const message = f.take("message", () => validate.text(req.message, 4000, "Please keep this under 4000 characters."));
  if (message !== undefined && [...message].length < 5) f.errors.message = "Please write a short message.";
  if (!f.ok) return invalid(f.errors);
  await db()`
    INSERT INTO contact_messages (id, name, email, college, message)
    VALUES (${randomUUID()}, ${name!}, ${email!}, ${college!}, ${message!})`;
  return { ok: true, value: null };
}
