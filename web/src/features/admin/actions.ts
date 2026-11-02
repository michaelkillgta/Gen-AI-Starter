"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import * as admin from "@/server/admin";
import { ADMIN_COOKIE, adminToken, cookieOptions, visitorIp } from "./server";

export type LoginState = { status: "idle" | "error"; message?: string };

export async function adminLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "");
  if (!password) return { status: "error", message: "Please enter the password." };

  let result: admin.LoginResult;
  try {
    result = await admin.login(await visitorIp(), password);
  } catch (e) {
    console.error("admin login:", e);
    return { status: "error", message: "We couldn't reach the database. Please try again." };
  }
  if (!result.ok) {
    switch (result.reason) {
      case "not-configured":
        return { status: "error", message: "Admin not set up yet: run pnpm admin:password" };
      case "wrong": {
        const n = result.triesLeft;
        return { status: "error", message: `Wrong password. ${n} ${n === 1 ? "try" : "tries"} left before a 15-minute lock.` };
      }
      case "locked":
        return {
          status: "error",
          message: `Too many wrong tries. Try again in ${Math.ceil(result.retryAfterSecs / 60)} minutes.`,
        };
    }
  }

  (await cookies()).set(ADMIN_COOKIE, result.token, await cookieOptions(result.expiresInSecs));
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  const token = await adminToken();
  if (token) await admin.logout(token).catch(() => undefined);
  (await cookies()).set(ADMIN_COOKIE, "", await cookieOptions(0));
  redirect("/admin/login");
}
