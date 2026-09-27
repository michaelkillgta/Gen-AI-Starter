"use client";

import { useActionState } from "react";

import { Button, TextField } from "@/components/ui";
import { adminLogin, type LoginState } from "@/features/admin/actions";
import styles from "./LoginForm.module.css";

const initial: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(adminLogin, initial);
  return (
    <form action={action} className={styles.form}>
      <TextField
        id="admin-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        autoFocus
        error={state.status === "error" ? state.message : undefined}
      />
      <Button type="submit" block disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
