import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminData } from "@/lib/api-types/AdminData";
import type { AdminStatus } from "@/lib/api-types/AdminStatus";

/**
 * Server-side calls to the admin API. The session token lives in an httpOnly
 * cookie scoped to /admin, so it is never readable by page scripts and never sent
 * with requests to the public site.
 */

export const API_URL = process.env.API_URL ?? "http://127.0.0.1:8080";
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

/** null when the API can't be reached. */
export async function getAdminStatus(): Promise<AdminStatus | null> {
  try {
    const res = await fetch(`${API_URL}/admin/status`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as AdminStatus) : null;
  } catch {
    return null;
  }
}

export type AdminLoad = { kind: "ok"; data: AdminData } | { kind: "not-set-up" } | { kind: "unreachable" };

/** For admin pages: the data, or why it isn't available. Signed out -> the sign-in page. */
export async function loadAdmin(): Promise<AdminLoad> {
  const status = await getAdminStatus();
  if (!status) return { kind: "unreachable" };
  if (!status.configured) return { kind: "not-set-up" };
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
    const res = await fetch(`${API_URL}/admin/data`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 401) return { ok: false, reason: "signed-out" };
    if (!res.ok) return { ok: false, reason: "unreachable" };
    return { ok: true, data: (await res.json()) as AdminData };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
