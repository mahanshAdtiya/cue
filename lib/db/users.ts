import { and, eq, sql } from "drizzle-orm";

import { db } from "./client";
import { authentications, users } from "./schema/auth";

function isUniqueViolation(error: unknown): boolean {
  const candidates = [error, (error as { cause?: unknown })?.cause];

  return candidates.some(
    (candidate) => (candidate as { code?: string })?.code === "23505",
  );
}

export async function findUserByEmail(email: string) {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: authentications.passwordHash,
    })
    .from(users)
    .innerJoin(authentications, eq(authentications.userId, users.id))
    .where(
      and(
        eq(sql`lower(${users.email})`, email.toLowerCase()),
        eq(authentications.provider, "PASSWORD"),
      ),
    )
    .limit(1);

  return row;
}

export async function createUserWithPassword(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ name: input.name, email: input.email.toLowerCase() })
        .returning({ id: users.id, name: users.name, email: users.email });

      await tx.insert(authentications).values({
        userId: user.id,
        provider: "PASSWORD",
        passwordHash: input.passwordHash,
      });

      return user;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return null;
    }

    throw error;
  }
}
