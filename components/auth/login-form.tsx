"use client";

import { useActionState } from "react";

import { login, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-1.5 mb-1 flex flex-col gap-3.5">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />
      <p aria-live="polite" className="text-danger text-[13px] empty:hidden">
        {state.error}
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
