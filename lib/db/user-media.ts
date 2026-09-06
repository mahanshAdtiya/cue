import { and, eq, isNull, or, sql } from "drizzle-orm";

import { db } from "./client";
import { media, type MediaType } from "./schema/media";
import { userMedia, type UserMediaStatus } from "./schema/user-media";
import { userMediaHistory } from "./schema/user-media-history";

const FAVORITED_UNTRACKED_STATUS: UserMediaStatus = "WATCHED";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type MediaKey = {
  externalId: string;
  type: MediaType;
};

export type MediaInput = MediaKey & {
  title: string;
  posterPath: string | null;
  description: string | null;
  releaseDate: string | null;
};

export type UserMediaEntry = MediaKey & {
  status: UserMediaStatus;
  currentSeason: number | null;
  currentEpisode: number | null;
  rating: number | null;
  isFavorite: boolean;
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
      description: input.description,
      releaseDate: input.releaseDate,
    })
    .onConflictDoUpdate({
      target: [media.mediaExternalId, media.type],
      set: {
        title: sql`excluded.title`,
        posterPath: sql`coalesce(excluded.poster_path, ${media.posterPath})`,
        description: sql`coalesce(excluded.description, ${media.description})`,
        releaseDate: sql`coalesce(excluded.release_date, ${media.releaseDate})`,
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
      description: media.description,
      releaseDate: media.releaseDate,
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