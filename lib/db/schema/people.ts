import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./auth";

export const people = pgTable(
  "people",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("chk_people_name_not_blank", sql`btrim(${t.name}) <> ''`),
    check(
      "chk_people_not_owner",
      sql`${t.userId} IS NULL OR ${t.userId} <> ${t.ownerUserId}`,
    ),
    uniqueIndex("uq_people_owner_linked_user")
      .on(t.ownerUserId, t.userId)
      .where(sql`user_id IS NOT NULL`),
    uniqueIndex("uq_people_owner_name").on(
      t.ownerUserId,
      sql`lower(btrim(${t.name}))`,
    ),
    index("idx_people_owner_user_id").on(t.ownerUserId),
    index("idx_people_linked_user_id")
      .on(t.userId)
      .where(sql`user_id IS NOT NULL`),
    index("idx_people_owner_active")
      .on(t.ownerUserId, t.updatedAt.desc())
      .where(sql`archived_at IS NULL`),
    index("idx_people_owner_archived")
      .on(t.ownerUserId, t.updatedAt.desc())
      .where(sql`archived_at IS NOT NULL`),
  ],
);
