"use client";

import { useActionState } from "react";

import { register, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";

const initialState: AuthState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="mt-1.5 mb-1 flex flex-col gap-3.5">
      <Field
        label="Name"
        name="name"
        autoComplete="name"
        placeholder="Mahansh"
        required
      />
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
        autoComplete="new-password"
        placeholder="••••••••"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      <p aria-live="polite" className="text-danger text-[13px] empty:hidden">
        {state.error}
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
