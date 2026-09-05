import { sql, type InferEnum } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { media, mediaType } from "./media";

export const userMediaStatus = pgEnum("user_media_status", [
  "WANT_TO_WATCH",
  "CURRENTLY_WATCHING",
  "WATCHED",
]);

export type UserMediaStatus = InferEnum<typeof userMediaStatus>;

export const userMedia = pgTable(
  "user_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").notNull(),
    type: mediaType("type").notNull(),
    status: userMediaStatus("status").notNull(),
    currentSeason: integer("current_season"),
    currentEpisode: integer("current_episode"),
    rating: smallint("rating"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "fk_user_media_media",
      columns: [t.mediaId, t.type],
      foreignColumns: [media.id, media.type],
    }).onDelete("restrict"),
    unique("uq_user_media_user_media").on(t.userId, t.mediaId),
    check(
      "chk_user_media_rating",
      sql`${t.rating} IS NULL OR ${t.rating} BETWEEN 1 AND 5`,
    ),
    check(
      "chk_user_media_season",
      sql`${t.currentSeason} IS NULL OR ${t.currentSeason} >= 1`,
    ),
    check(
      "chk_user_media_episode",
      sql`${t.currentEpisode} IS NULL OR ${t.currentEpisode} >= 1`,
    ),
    check(
      "chk_user_media_episode_requires_season",
      sql`${t.currentEpisode} IS NULL OR ${t.currentSeason} IS NOT NULL`,
    ),
    check(
      "chk_user_media_movie_progress",
      sql`${t.type} = 'TV_SHOW' OR (${t.currentSeason} IS NULL AND ${t.currentEpisode} IS NULL)`,
    ),
    index("idx_user_media_user_status_updated")
      .on(t.userId, t.status, t.updatedAt.desc())
      .where(sql`archived_at IS NULL`),
    index("idx_user_media_user_archived")
      .on(t.userId, t.updatedAt.desc())
      .where(sql`archived_at IS NOT NULL`),
  ],
);
