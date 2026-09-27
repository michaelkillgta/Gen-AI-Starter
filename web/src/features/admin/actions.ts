"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminLoginResponse } from "@/lib/api-types/AdminLoginResponse";
import { ADMIN_COOKIE, API_URL, adminToken, cookieOptions } from "./server";

export type LoginState = { status: "idle" | "error"; message?: string };

/** What the API needs to check the request: the visitor's IP (lockout) and the page's origin. */
async function forwarded(): Promise<Record<string, string>> {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const out: Record<string, string> = { "x-forwarded-for": ip };
  const origin = h.get("origin");
  if (origin) out.origin = origin;
  return out;
}

export async function adminLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "");
  if (!password) return { status: "error", message: "Please enter the password." };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(await forwarded()) },
      body: JSON.stringify({ password }),
      cache: "no-store",
    });
  } catch {
    return { status: "error", message: "We couldn't reach the server. Is the API running (pnpm dev)?" };
  }
  const body = (await res.json().catch(() => ({}))) as Partial<AdminLoginResponse> & {
    error?: string;
    tries_left?: number;
  };
  if (!res.ok || !body.token) {
    if (res.status === 401 && typeof body.tries_left === "number") {
      const n = body.tries_left;
      return { status: "error", message: `Wrong password. ${n} ${n === 1 ? "try" : "tries"} left before a 15-minute lock.` };
    }
    return { status: "error", message: body.error ?? "Something went wrong. Please try again." };
  }

  (await cookies()).set(ADMIN_COOKIE, body.token, await cookieOptions(body.expires_in_secs ?? 43_200));
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  const token = await adminToken();
  if (token) {
    await fetch(`${API_URL}/admin/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, ...(await forwarded()) },
      cache: "no-store",
    }).catch(() => undefined);
  }
  (await cookies()).set(ADMIN_COOKIE, "", await cookieOptions(0));
  redirect("/admin/login");
}
