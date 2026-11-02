import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import type { AdminData } from "@/lib/api-types/AdminData";
import type { AdminStatus } from "@/lib/api-types/AdminStatus";
import * as admin from "@/server/admin";

/**
 * Admin sign-in helpers for the pages. The session token lives in an httpOnly
 * cookie scoped to /admin, so it is never readable by page scripts and never sent
 * with requests to the public site.
 */

export const ADMIN_COOKIE = "ft_admin";

/** Cookie settings: Secure everywhere except plain-http localhost during development. */
export async function cookieOptions(maxAge: number) {
  const host = (await headers()).get("host") ?? "";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  return { httpOnly: true, sameSite: "strict" as const, secure: !local, path: "/admin", maxAge };
}

export async function adminToken(): Promise<string | null> {
  return (await cookies()).get(ADMIN_COOKIE)?.value ?? null;
}

/** The visitor's IP, for the wrong-password lockout and the form rate limit. */
export async function visitorIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/** Never null any more (the check needs no server); kept so pages read the same. */
export async function getAdminStatus(): Promise<AdminStatus | null> {
  await connection(); // read the password setting per request, not once at build time
  return { configured: admin.configured() };
}

export type AdminLoad = { kind: "ok"; data: AdminData } | { kind: "not-set-up" } | { kind: "unreachable" };

/** For admin pages: the data, or why it isn't available. Signed out -> the sign-in page. */
export async function loadAdmin(): Promise<AdminLoad> {
  await connection();
  if (!admin.configured()) return { kind: "not-set-up" };
  const result = await getAdminData();
  if (!result.ok && result.reason === "signed-out") redirect("/admin/login");
  if (!result.ok) return { kind: "unreachable" };
  return { kind: "ok", data: result.data };
}

export type AdminDataResult = { ok: true; data: AdminData } | { ok: false; reason: "signed-out" | "unreachable" };

export async function getAdminData(): Promise<AdminDataResult> {
  const token = await adminToken();
  if (!token) return { ok: false, reason: "signed-out" };
  try {
    if (!(await admin.check(token))) return { ok: false, reason: "signed-out" };
    return { ok: true, data: await admin.data() };
  } catch (e) {
    console.error("admin data:", e);
    return { ok: false, reason: "unreachable" };
  }
}
