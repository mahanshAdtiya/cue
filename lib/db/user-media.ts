import { and, asc, count, desc, eq, isNull, max, or, sql } from "drizzle-orm";

import { db } from "./client";
import { media, type MediaType } from "./schema/media";
import { userMedia, type UserMediaStatus } from "./schema/user-media";
import { userMediaEpisode } from "./schema/user-media-episode";
import { userMediaHistory } from "./schema/user-media-history";

const FAVORITED_UNTRACKED_STATUS: UserMediaStatus = "WATCHED";
const RATED_UNTRACKED_STATUS: UserMediaStatus = "WATCHED";
const FINISHED_STATUS: UserMediaStatus = "WATCHED";
const STARTED_STATUS: UserMediaStatus = "CURRENTLY_WATCHING";

const ZERO_COUNTS: UserMediaCounts = {
  WANT_TO_WATCH: 0,
  CURRENTLY_WATCHING: 0,
  WATCHED: 0,
};

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type MediaKey = {
  externalId: string;
  type: MediaType;
};

export type MediaInput = MediaKey & {
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  description: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  episodeCount: number | null;
};

export type UserMediaEntry = MediaKey & {
  status: UserMediaStatus;
  currentSeason: number | null;
  currentEpisode: number | null;
  rating: number | null;
  isFavorite: boolean;
};

export type LibraryRow = MediaInput & {
  status: UserMediaStatus;
  currentSeason: number | null;
  currentEpisode: number | null;
  rating: number | null;
  isFavorite: boolean;
};

export type WatchedRow = LibraryRow & {
  watchedAt: Date | null;
};

export type UserMediaCounts = Record<UserMediaStatus, number>;

const libraryColumns = {
  externalId: media.mediaExternalId,
  type: media.type,
  title: media.title,
  posterPath: media.posterPath,
  backdropPath: media.backdropPath,
  description: media.description,
  releaseDate: media.releaseDate,
  voteAverage: media.voteAverage,
  episodeCount: media.episodeCount,
  status: userMedia.status,
  currentSeason: userMedia.currentSeason,
  currentEpisode: userMedia.currentEpisode,
  rating: userMedia.rating,
  isFavorite: userMedia.isFavorite,
};

async function recordFinish(tx: Transaction, userId: string, mediaId: string) {
  await tx.insert(userMediaHistory).values({ userId, mediaId });
}

function ownRow(userId: string, mediaId: string) {
  return and(eq(userMedia.userId, userId), eq(userMedia.mediaId, mediaId));
}

async function upsertMedia(tx: Transaction, input: MediaInput) {
  const [row] = await tx
    .insert(media)
    .values({
      mediaExternalId: input.externalId,
      type: input.type,
      title: input.title,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      description: input.description,
      releaseDate: input.releaseDate,
      voteAverage: input.voteAverage,
      episodeCount: input.episodeCount,
    })
    .onConflictDoUpdate({
      target: [media.mediaExternalId, media.type],
      set: {
        title: sql`excluded.title`,
        posterPath: sql`coalesce(excluded.poster_path, ${media.posterPath})`,
        backdropPath: sql`coalesce(excluded.backdrop_path, ${media.backdropPath})`,
        description: sql`coalesce(excluded.description, ${media.description})`,
        releaseDate: sql`coalesce(excluded.release_date, ${media.releaseDate})`,
        voteAverage: sql`coalesce(excluded.vote_average, ${media.voteAverage})`,
        episodeCount: sql`coalesce(excluded.episode_count, ${media.episodeCount})`,
        updatedAt: new Date(),
      },
    })
    .returning({ id: media.id });

  return row.id;
}

export async function setUserMediaFavorite(input: {
  userId: string;
  media: MediaInput;
  isFavorite: boolean;
}) {
  return db.transaction(async (tx) => {
    const mediaId = await upsertMedia(tx, input.media);

    if (input.isFavorite) {
      const [created] = await tx
        .insert(userMedia)
        .values({
          userId: input.userId,
          mediaId,
          type: input.media.type,
          status: FAVORITED_UNTRACKED_STATUS,
          isFavorite: true,
        })
        .onConflictDoNothing({
          target: [userMedia.userId, userMedia.mediaId],
        })
        .returning();

      if (created) {
        await recordFinish(tx, input.userId, mediaId);

        return { entry: created, created: true };
      }
    }

    const [entry] = await tx
      .update(userMedia)
      .set({ isFavorite: input.isFavorite, updatedAt: new Date() })
      .where(ownRow(input.userId, mediaId))
      .returning();

    return { entry: entry ?? null, created: false };
  });
}

export async function findMediaByExternalId(
  key: MediaKey,
): Promise<MediaInput | null> {
  const [row] = await db
    .select({
      externalId: media.mediaExternalId,
      type: media.type,
      title: media.title,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      description: media.description,
      releaseDate: media.releaseDate,
      voteAverage: media.voteAverage,
      episodeCount: media.episodeCount,
    })
    .from(media)
    .where(
      and(eq(media.mediaExternalId, key.externalId), eq(media.type, key.type)),
    )
    .limit(1);

  return row ?? null;
}

export async function setUserMediaStatus(input: {
  userId: string;
  media: MediaInput;
  status: UserMediaStatus;
}) {
  return db.transaction(async (tx) => {
    const mediaId = await upsertMedia(tx, input.media);

    let [entry] = await tx
      .insert(userMedia)
      .values({
        userId: input.userId,
        mediaId,
        type: input.media.type,
        status: input.status,
      })
      .onConflictDoNothing({
        target: [userMedia.userId, userMedia.mediaId],
      })
      .returning();

    let previousStatus: UserMediaStatus | null = null;

    if (!entry) {
      previousStatus = await lockStatus(tx, input.userId, mediaId);

      [entry] = await tx
        .update(userMedia)
        .set({ status: input.status, updatedAt: new Date() })
        .where(ownRow(input.userId, mediaId))
        .returning();
    }

    const finished = input.status === "WATCHED" && previousStatus !== "WATCHED";

    if (finished) {
      await recordFinish(tx, input.userId, mediaId);
    }

    return { entry, previousStatus, finished };
  });
}

export async function findUserMediaByExternalIds(
  userId: string,
  keys: MediaKey[],
): Promise<UserMediaEntry[]> {
  if (keys.length === 0) {
    return [];
  }

  return db
    .select({
      externalId: media.mediaExternalId,
      type: media.type,
      status: userMedia.status,
      currentSeason: userMedia.currentSeason,
      currentEpisode: userMedia.currentEpisode,
      rating: userMedia.rating,
      isFavorite: userMedia.isFavorite,
    })
    .from(userMedia)
    .innerJoin(media, eq(media.id, userMedia.mediaId))
    .where(
      and(
        eq(userMedia.userId, userId),
        isNull(userMedia.archivedAt),
        or(
          ...keys.map((key) =>
            and(
              eq(media.mediaExternalId, key.externalId),
              eq(media.type, key.type),
            ),
          ),
        ),
      ),
    );
}

async function lockStatus(tx: Transaction, userId: string, mediaId: string) {
  const [row] = await tx
    .select({ status: userMedia.status })
    .from(userMedia)
    .where(ownRow(userId, mediaId))
    .for("update");

  return row.status;
}
export async function listUserMediaByStatus(
  userId: string,
  status: UserMediaStatus,
  limit: number,
): Promise<LibraryRow[]> {
  return db
    .select(libraryColumns)
    .from(userMedia)
    .innerJoin(media, eq(media.id, userMedia.mediaId))
    .where(
      and(
        eq(userMedia.userId, userId),
        eq(userMedia.status, status),
        isNull(userMedia.archivedAt),
      ),
    )
    .orderBy(desc(userMedia.updatedAt))
    .limit(limit);
}

export async function listRecentlyWatched(
  userId: string,
  limit: number,
): Promise<WatchedRow[]> {
  const lastWatchedAt = max(userMediaHistory.watchedAt);

  return db
    .select({ ...libraryColumns, watchedAt: lastWatchedAt })
    .from(userMediaHistory)
    .innerJoin(media, eq(media.id, userMediaHistory.mediaId))
    .innerJoin(
      userMedia,
      and(
        eq(userMedia.userId, userMediaHistory.userId),
        eq(userMedia.mediaId, userMediaHistory.mediaId),
      ),
    )
    .where(
      and(eq(userMediaHistory.userId, userId), isNull(userMedia.archivedAt)),
    )
    .groupBy(media.id, userMedia.id)
    .orderBy(desc(lastWatchedAt))
    .limit(limit);
}

export async function countUserMediaByStatus(
  userId: string,
): Promise<UserMediaCounts> {
  const rows = await db
    .select({ status: userMedia.status, total: count() })
    .from(userMedia)
    .where(and(eq(userMedia.userId, userId), isNull(userMedia.archivedAt)))
    .groupBy(userMedia.status);

  const counts = { ...ZERO_COUNTS };

  for (const row of rows) {
    counts[row.status] = row.total;
  }

  return counts;
}

async function findMediaId(
  tx: Transaction,
  key: MediaKey,
): Promise<string | null> {
  const [row] = await tx
    .select({ id: media.id })
    .from(media)
    .where(
      and(eq(media.mediaExternalId, key.externalId), eq(media.type, key.type)),
    )
    .limit(1);

  return row?.id ?? null;
}

async function countWatches(
  tx: Transaction,
  userId: string,
  mediaId: string,
): Promise<number> {
  const [row] = await tx
    .select({ total: count() })
    .from(userMediaHistory)
    .where(
      and(
        eq(userMediaHistory.userId, userId),
        eq(userMediaHistory.mediaId, mediaId),
      ),
    );

  return row?.total ?? 0;
}

export async function countUserMediaWatches(
  userId: string,
  key: MediaKey,
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(userMediaHistory)
    .innerJoin(media, eq(media.id, userMediaHistory.mediaId))
    .where(
      and(
        eq(userMediaHistory.userId, userId),
        eq(media.mediaExternalId, key.externalId),
        eq(media.type, key.type),
      ),
    );

  return row?.total ?? 0;
}

export async function setUserMediaRating(input: {
  userId: string;
  media: MediaInput;
  rating: number | null;
}) {
  return db.transaction(async (tx) => {
    const mediaId = await upsertMedia(tx, input.media);

    if (input.rating !== null) {
      const [created] = await tx
        .insert(userMedia)
        .values({
          userId: input.userId,
          mediaId,
          type: input.media.type,
          status: RATED_UNTRACKED_STATUS,
          rating: input.rating,
        })
        .onConflictDoNothing({
          target: [userMedia.userId, userMedia.mediaId],
        })
        .returning();

      if (created) {
        await recordFinish(tx, input.userId, mediaId);

        return { entry: created, created: true };
      }
    }

    const [entry] = await tx
      .update(userMedia)
      .set({ rating: input.rating, updatedAt: new Date() })
      .where(ownRow(input.userId, mediaId))
      .returning();

    return { entry: entry ?? null, created: false };
  });
}

export async function addUserMediaWatch(input: {
  userId: string;
  media: MediaInput;
}) {
  return db.transaction(async (tx) => {
    const mediaId = await upsertMedia(tx, input.media);

    await tx
      .insert(userMedia)
      .values({
        userId: input.userId,
        mediaId,
        type: input.media.type,
        status: FINISHED_STATUS,
      })
      .onConflictDoUpdate({
        target: [userMedia.userId, userMedia.mediaId],
        set: { status: FINISHED_STATUS, updatedAt: new Date() },
      });

    await recordFinish(tx, input.userId, mediaId);

    return { watches: await countWatches(tx, input.userId, mediaId) };
  });
}

export async function removeUserMediaWatch(input: {
  userId: string;
  key: MediaKey;
}) {
  return db.transaction(async (tx) => {
    const mediaId = await findMediaId(tx, input.key);

    if (!mediaId) return { watches: 0 };

    const [latest] = await tx
      .select({ id: userMediaHistory.id })
      .from(userMediaHistory)
      .where(
        and(
          eq(userMediaHistory.userId, input.userId),
          eq(userMediaHistory.mediaId, mediaId),
        ),
      )
      .orderBy(desc(userMediaHistory.watchedAt))
      .limit(1);

    if (latest) {
      await tx
        .delete(userMediaHistory)
        .where(eq(userMediaHistory.id, latest.id));
    }

    return { watches: await countWatches(tx, input.userId, mediaId) };
  });
}

export type WatchedEpisode = {
  seasonNumber: number;
  episodeNumber: number;
};

export async function listWatchedEpisodes(
  userId: string,
  key: MediaKey,
): Promise<WatchedEpisode[]> {
  return db
    .select({
      seasonNumber: userMediaEpisode.seasonNumber,
      episodeNumber: userMediaEpisode.episodeNumber,
    })
    .from(userMediaEpisode)
    .innerJoin(media, eq(media.id, userMediaEpisode.mediaId))
    .where(
      and(
        eq(userMediaEpisode.userId, userId),
        eq(media.mediaExternalId, key.externalId),
        eq(media.type, key.type),
      ),
    )
    .orderBy(
      asc(userMediaEpisode.seasonNumber),
      asc(userMediaEpisode.episodeNumber),
    );
}

async function furthestEpisode(
  tx: Transaction,
  userId: string,
  mediaId: string,
): Promise<WatchedEpisode | null> {
  const [row] = await tx
    .select({
      seasonNumber: userMediaEpisode.seasonNumber,
      episodeNumber: userMediaEpisode.episodeNumber,
    })
    .from(userMediaEpisode)
    .where(
      and(
        eq(userMediaEpisode.userId, userId),
        eq(userMediaEpisode.mediaId, mediaId),
      ),
    )
    .orderBy(
      desc(userMediaEpisode.seasonNumber),
      desc(userMediaEpisode.episodeNumber),
    )
    .limit(1);

  return row ?? null;
}

async function episodeStatus(
  tx: Transaction,
  userId: string,
  mediaId: string,
): Promise<UserMediaStatus> {
  const [row] = await tx
    .select({ status: userMedia.status })
    .from(userMedia)
    .where(ownRow(userId, mediaId))
    .limit(1);

  return row?.status === FINISHED_STATUS ? FINISHED_STATUS : STARTED_STATUS;
}

export async function countWatchedEpisodes(
  userId: string,
  key: MediaKey,
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(userMediaEpisode)
    .innerJoin(media, eq(media.id, userMediaEpisode.mediaId))
    .where(
      and(
        eq(userMediaEpisode.userId, userId),
        eq(media.mediaExternalId, key.externalId),
        eq(media.type, key.type),
      ),
    );

  return row?.total ?? 0;
}

export async function setUserMediaEpisode(input: {
  userId: string;
  media: MediaInput;
  seasonNumber: number;
  episodeNumber: number;
  watched: boolean;
}) {
  return db.transaction(async (tx) => {
    const mediaId = await upsertMedia(tx, input.media);

    if (input.watched) {
      await tx
        .insert(userMediaEpisode)
        .values({
          userId: input.userId,
          mediaId,
          type: input.media.type,
          seasonNumber: input.seasonNumber,
          episodeNumber: input.episodeNumber,
        })
        .onConflictDoNothing({
          target: [
            userMediaEpisode.userId,
            userMediaEpisode.mediaId,
            userMediaEpisode.seasonNumber,
            userMediaEpisode.episodeNumber,
          ],
        });
    } else {
      await tx.delete(userMediaEpisode).where(
        and(
          eq(userMediaEpisode.userId, input.userId),
          eq(userMediaEpisode.mediaId, mediaId),
          eq(userMediaEpisode.seasonNumber, input.seasonNumber),
          eq(userMediaEpisode.episodeNumber, input.episodeNumber),
        ),
      );
    }

    const furthest = await furthestEpisode(tx, input.userId, mediaId);
    const status = await episodeStatus(tx, input.userId, mediaId);

    await tx
      .insert(userMedia)
      .values({
        userId: input.userId,
        mediaId,
        type: input.media.type,
        status,
        currentSeason: furthest?.seasonNumber ?? null,
        currentEpisode: furthest?.episodeNumber ?? null,
      })
      .onConflictDoUpdate({
        target: [userMedia.userId, userMedia.mediaId],
        set: {
          status,
          currentSeason: furthest?.seasonNumber ?? null,
          currentEpisode: furthest?.episodeNumber ?? null,
          updatedAt: new Date(),
        },
      });

    const [watched] = await tx
      .select({ total: count() })
      .from(userMediaEpisode)
      .where(
        and(
          eq(userMediaEpisode.userId, input.userId),
          eq(userMediaEpisode.mediaId, mediaId),
        ),
      );

    return { watched: watched?.total ?? 0 };
  });
}
