import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { media, mediaType } from "./media";

export const userMediaEpisode = pgTable(
  "user_media_episode",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").notNull(),
    type: mediaType("type").notNull(),
    seasonNumber: integer("season_number").notNull(),
    episodeNumber: integer("episode_number").notNull(),
    watchedAt: timestamp("watched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "fk_user_media_episode_media",
      columns: [t.mediaId, t.type],
      foreignColumns: [media.id, media.type],
    }).onDelete("cascade"),
    unique("uq_user_media_episode").on(
      t.userId,
      t.mediaId,
      t.seasonNumber,
      t.episodeNumber,
    ),
    check("chk_user_media_episode_is_show", sql`${t.type} = 'TV_SHOW'`),
    check("chk_user_media_episode_season", sql`${t.seasonNumber} >= 1`),
    check("chk_user_media_episode_episode", sql`${t.episodeNumber} >= 1`),
    index("idx_user_media_episode_user_media").on(t.userId, t.mediaId),
  ],
);
