import "server-only";

import * as crypto from "node:crypto";

import type { AdminData } from "@/lib/api-types/AdminData";

import { currentChallenge } from "./content";
import { db } from "./db";

/**
 * The admin area's sign-in: one password, stored only as an argon2id hash
 * (`ADMIN_PASSWORD_HASH`), sessions kept for 12 hours, and a lockout after too
 * many wrong tries from one IP. Sessions and wrong tries live in the database
 * (only a SHA-256 of each token), because serverless functions share no memory.
 *
 * Requests from other sites are already refused by Next.js itself: server actions
 * only run when the browser's Origin matches the site.
 */

/** How long a sign-in lasts. */
export const SESSION_TTL_SECS = 12 * 60 * 60;
/** Wrong passwords allowed from one IP before it is locked out. */
const MAX_FAILS = 5;
/** How long a locked-out IP has to wait. */
const LOCKOUT_SECS = 15 * 60;

export type LoginResult =
  | { ok: true; token: string; expiresInSecs: number }
  | { ok: false; reason: "not-configured" }
  | { ok: false; reason: "wrong"; triesLeft: number }
  | { ok: false; reason: "locked"; retryAfterSecs: number };

/**
 * The argon2id hash. `pnpm admin:password` gives it base64-encoded, because Next.js
 * rewrites `$` signs in values that a .env file also sets; a raw `$argon2id$…`
 * value still works where nothing rewrites it (e.g. typed into Vercel).
 */
function passwordHash(): string | null {
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!raw) return null;
  return raw.startsWith("$") ? raw : Buffer.from(raw, "base64").toString("utf8");
}

export const configured = () => passwordHash() !== null;

// Node 24's built-in argon2 (newer than the installed @types/node).
type Argon2 = (
  algorithm: "argon2id",
  opts: { message: string; nonce: Buffer; tagLength: number; memory: number; passes: number; parallelism: number },
  cb: (err: Error | null, out: Buffer) => void,
) => void;
const argon2 = (crypto as unknown as { argon2: Argon2 }).argon2;

const fromB64 = (s: string) => Buffer.from(s, "base64");

/** Checks `password` against an argon2id hash in PHC form ($argon2id$v=19$m=…,t=…,p=…$salt$hash). */
async function verify(hash: string, password: string): Promise<boolean> {
  const m = hash.match(/^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/);
  if (!m) {
    console.error("ADMIN_PASSWORD_HASH is not a valid argon2id hash");
    return false;
  }
  const expected = fromB64(m[5]);
  const actual = await new Promise<Buffer>((resolve, reject) =>
    argon2(
      "argon2id",
      {
        message: password,
        nonce: fromB64(m[4]),
        tagLength: expected.length,
        memory: Number(m[1]),
        passes: Number(m[2]),
        parallelism: Number(m[3]),
      },
      (err, out) => (err ? reject(err) : resolve(out)),
    ),
  );
  return crypto.timingSafeEqual(actual, expected);
}

const sha256 = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function login(ip: string, password: string): Promise<LoginResult> {
  const hash = passwordHash();
  if (!hash) return { ok: false, reason: "not-configured" };
  const sql = db();

  const [fails] = await sql`
    SELECT CEIL(EXTRACT(EPOCH FROM locked_until - now()))::int AS wait FROM admin_login_fails
    WHERE ip = ${ip} AND locked_until IS NOT NULL`;
  if (fails && fails.wait > 0) return { ok: false, reason: "locked", retryAfterSecs: fails.wait };
  // A lock that has run out starts the count again.
  if (fails) await sql`DELETE FROM admin_login_fails WHERE ip = ${ip}`;

  if (await verify(hash, password)) {
    await sql`DELETE FROM admin_login_fails WHERE ip = ${ip}`;
    await sql`DELETE FROM admin_sessions WHERE expires_at < now()`;
    const token = crypto.randomBytes(32).toString("hex");
    await sql`
      INSERT INTO admin_sessions (token_hash, expires_at)
      VALUES (${sha256(token)}, now() + make_interval(secs => ${SESSION_TTL_SECS}))`;
    return { ok: true, token, expiresInSecs: SESSION_TTL_SECS };
  }

  const [row] = await sql`
    INSERT INTO admin_login_fails (ip, count) VALUES (${ip}, 1)
    ON CONFLICT (ip) DO UPDATE SET count = admin_login_fails.count + 1
    RETURNING count`;
  if (row.count >= MAX_FAILS) {
    await sql`
      UPDATE admin_login_fails SET count = 0, locked_until = now() + make_interval(secs => ${LOCKOUT_SECS})
      WHERE ip = ${ip}`;
    return { ok: false, reason: "locked", retryAfterSecs: LOCKOUT_SECS };
  }
  return { ok: false, reason: "wrong", triesLeft: MAX_FAILS - row.count };
}

/** True when `token` is a live session. */
export async function check(token: string): Promise<boolean> {
  const [row] = await db()`SELECT 1 FROM admin_sessions WHERE token_hash = ${sha256(token)} AND expires_at > now()`;
  return row !== undefined;
}

export async function logout(token: string): Promise<void> {
  await db()`DELETE FROM admin_sessions WHERE token_hash = ${sha256(token)}`;
}

const iso = (d: Date) => d.toISOString();

/** Every sign-up, suggestion, subscriber and message, newest first. */
export async function data(): Promise<AdminData> {
  const sql = db();
  const challenge = await currentChallenge();
  const [waitlist, suggestions, subscribers, contacts] = await Promise.all([
    sql`SELECT * FROM waitlist_signups WHERE challenge_slug = ${challenge.slug} ORDER BY created_at DESC`,
    sql`SELECT * FROM suggestions ORDER BY created_at DESC`,
    sql`SELECT * FROM subscribers ORDER BY created_at DESC`,
    sql`SELECT * FROM contact_messages ORDER BY created_at DESC`,
  ]);
  return {
    challenge: challenge.slug,
    waitlist: waitlist.map((r) => ({ position: r.position, name: r.name, phone: r.phone, email: r.email, created_at: iso(r.created_at) })),
    suggestions: suggestions.map((r) => ({
      about: r.about,
      title: r.title,
      details: r.details,
      link: r.link,
      contact: r.contact,
      created_at: iso(r.created_at),
    })),
    subscribers: subscribers.map((r) => ({ kind: r.kind, value: r.value, source: r.source, created_at: iso(r.created_at) })),
    contacts: contacts.map((r) => ({ name: r.name, email: r.email, college: r.college, message: r.message, created_at: iso(r.created_at) })),
  };
}
