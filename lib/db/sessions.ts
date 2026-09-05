import { and, eq, gt, lt } from "drizzle-orm";

import { db } from "./client";
import { sessions, users } from "./schema/auth";

export async function createSession(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  const [session] = await db
    .insert(sessions)
    .values({ userId, tokenHash, expiresAt })
    .returning();

  return session;
}

export async function findSessionByHash(tokenHash: string) {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      sessionExpiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return row;
}

export async function deleteSession(tokenHash: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteAllSessionsForUser(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function deleteExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
