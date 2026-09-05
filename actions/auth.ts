"use server";

import { redirect } from "next/navigation";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createUserSession, destroySession } from "@/lib/auth/session";
import { INVALID_CREDENTIALS_MESSAGE } from "@/lib/constants";
import { createUserWithPassword, findUserByEmail } from "@/lib/db/users";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export type AuthState = { error?: string; ok?: boolean };

export async function register(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await hashPassword(password);
  const user = await createUserWithPassword({ name, email, passwordHash });

  if (!user) {
    return { error: "That email is already registered." };
  }

  await createUserSession(user.id);

  redirect("/");
}

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);

  if (
    !user?.passwordHash ||
    !(await verifyPassword(user.passwordHash, password))
  ) {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  await createUserSession(user.id);

  return { ok: true };
}

export async function logout() {
  await destroySession();

  redirect("/");
}
