import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { media } from "./media";
import { people } from "./people";

export const sharedMediaHistory = pgTable(
  "shared_media_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    watchedAt: timestamp("watched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_shared_media_history_person_watched_at").on(
      t.personId,
      t.watchedAt.desc(),
    ),
    index("idx_shared_media_history_person_media").on(t.personId, t.mediaId),
  ],
);
