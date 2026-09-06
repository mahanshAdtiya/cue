import { cookies } from "next/headers";
import { cache } from "react";

import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_PATH,
  SESSION_LIFETIME_MS,
} from "@/lib/constants";
import {
  createSession,
  deleteSession,
  findSessionByHash,
} from "@/lib/db/sessions";

import { generateSessionToken, hashSessionToken } from "./tokens";

export async function createUserSession(userId: string) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

  await createSession(userId, hashSessionToken(token), expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: SESSION_COOKIE_PATH,
    expires: expiresAt,
  });
}

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const user = await findSessionByHash(hashSessionToken(token));

  return user ?? null;
});

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteSession(hashSessionToken(token));
  }

  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    path: SESSION_COOKIE_PATH,
  });
}
