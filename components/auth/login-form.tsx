"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { login, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SIGNED_IN_TOAST } from "@/lib/constants";
import { toast } from "@/lib/toast/store";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.err(state.error);

    if (state.ok) {
      toast.show(SIGNED_IN_TOAST);
      router.replace("/");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      noValidate
      className="mt-1.5 mb-1 flex flex-col gap-3.5"
    >
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
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
