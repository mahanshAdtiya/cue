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

import { media, mediaType } from "./media";
import { people } from "./people";
import { userMediaStatus } from "./user-media";

export const sharedMedia = pgTable(
  "shared_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").notNull(),
    type: mediaType("type").notNull(),
    status: userMediaStatus("status").notNull(),
    currentSeason: integer("current_season"),
    currentEpisode: integer("current_episode"),
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
      name: "fk_shared_media_media",
      columns: [t.mediaId, t.type],
      foreignColumns: [media.id, media.type],
    }).onDelete("restrict"),
    unique("uq_shared_media_person_media").on(t.personId, t.mediaId),
    check(
      "chk_shared_media_season",
      sql`${t.currentSeason} IS NULL OR ${t.currentSeason} >= 1`,
    ),
    check(
      "chk_shared_media_episode",
      sql`${t.currentEpisode} IS NULL OR ${t.currentEpisode} >= 1`,
    ),
    check(
      "chk_shared_media_episode_requires_season",
      sql`${t.currentEpisode} IS NULL OR ${t.currentSeason} IS NOT NULL`,
    ),
    check(
      "chk_shared_media_movie_progress",
      sql`${t.type} = 'TV_SHOW' OR (${t.currentSeason} IS NULL AND ${t.currentEpisode} IS NULL)`,
    ),
    index("idx_shared_media_person_status_updated")
      .on(t.personId, t.status, t.updatedAt.desc())
      .where(sql`archived_at IS NULL`),
    index("idx_shared_media_person_archived")
      .on(t.personId, t.updatedAt.desc())
      .where(sql`archived_at IS NOT NULL`),
  ],
);
