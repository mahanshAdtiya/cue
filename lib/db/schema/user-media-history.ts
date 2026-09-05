import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { media } from "./media";

export const userMediaHistory = pgTable(
  "user_media_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    index("idx_user_media_history_user_watched_at").on(
      t.userId,
      t.watchedAt.desc(),
    ),
    index("idx_user_media_history_user_media").on(t.userId, t.mediaId),
  ],
);
