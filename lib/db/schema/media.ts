import { sql } from "drizzle-orm";
import {
  check,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const mediaType = pgEnum("media_type", ["MOVIE", "TV_SHOW"]);

export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mediaExternalId: varchar("media_external_id", { length: 100 }).notNull(),
    type: mediaType("type").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    posterPath: text("poster_path"),
    description: text("description"),
    releaseDate: date("release_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_media_media_external_id_type").on(t.mediaExternalId, t.type),
    unique("uq_media_id_type").on(t.id, t.type),
    check(
      "chk_media_media_external_id_not_blank",
      sql`btrim(${t.mediaExternalId}) <> ''`,
    ),
    check("chk_media_title_not_blank", sql`btrim(${t.title}) <> ''`),
  ],
);
