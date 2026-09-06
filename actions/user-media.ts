"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import {
  FIRST_SEASON_NUMBER,
  MEDIA_KEY_SEPARATOR,
  MEDIA_RATING_MIN,
  MEDIA_RATING_STARS,
  MEDIA_UNAVAILABLE_MESSAGE,
  SIGN_IN_PATH,
  SIGN_IN_REQUIRED_MESSAGE,
  TRACKING_FAILED_MESSAGE,
} from "@/lib/constants";
import { mediaType } from "@/lib/db/schema/media";
import { userMediaStatus } from "@/lib/db/schema/user-media";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import {
  addUserMediaWatch,
  findMediaByExternalId,
  removeUserMediaWatch,
  setUserMediaFavorite,
  setUserMediaEpisode,
  setUserMediaRating,
  setUserMediaStatus,
  type MediaInput,
} from "@/lib/db/user-media";
import { getMovieDetails, getTvDetails } from "@/lib/tmdb/queries";

const mediaRefSchema = z.object({
  type: z.enum(mediaType.enumValues),
  externalId: z.string().trim().min(1),
});

const favoriteSchema = z.object({
  mediaKey: z.string(),
  isFavorite: z.boolean(),
});

export type FavoriteInput = z.input<typeof favoriteSchema>;

export type FavoriteState = {
  error?: string;
  redirectTo?: string;
  isFavorite?: boolean;
  created?: boolean;
};

export type StatusInput = {
  mediaKey: string;
  status: UserMediaStatus;
};

export type StatusState = {
  error?: string;
  redirectTo?: string;
  status?: UserMediaStatus;
  previousStatus?: UserMediaStatus | null;
};

const statusSchema = z.object({
  mediaKey: z.string(),
  status: z.enum(userMediaStatus.enumValues),
});

type MediaRef = z.infer<typeof mediaRefSchema>;

function toMediaRef(mediaKey: string) {
  const [type, externalId] = mediaKey.split(MEDIA_KEY_SEPARATOR);
  return mediaRefSchema.safeParse({ type, externalId });
}

async function resolveMedia(ref: MediaRef): Promise<MediaInput> {
  return (await findMediaByExternalId(ref)) ?? loadMedia(ref);
}

async function loadMedia({ externalId, type }: MediaRef): Promise<MediaInput> {
  const details =
    type === "MOVIE"
      ? await getMovieDetails(externalId)
      : await getTvDetails(externalId);

  return {
    externalId: details.externalId,
    type: details.type,
    title: details.title,
    posterPath: details.posterPath,
    backdropPath: details.backdropPath,
    description: details.description,
    releaseDate: details.releaseDate,
    voteAverage: details.voteAverage,
    episodeCount: details.episodeCount,
  };
}

export async function setFavorite(
  input: FavoriteInput,
): Promise<FavoriteState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: SIGN_IN_REQUIRED_MESSAGE, redirectTo: SIGN_IN_PATH };
  }

  const parsed = favoriteSchema.safeParse(input);

  if (!parsed.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  const { mediaKey, isFavorite } = parsed.data;
  const ref = toMediaRef(mediaKey);

  if (!ref.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  let media = await findMediaByExternalId(ref.data);

  if (!media) {
    if (!isFavorite) {
      return { isFavorite: false };
    }

    try {
      media = await loadMedia(ref.data);
    } catch {
      return { error: MEDIA_UNAVAILABLE_MESSAGE };
    }
  }

  let result: Awaited<ReturnType<typeof setUserMediaFavorite>>;

  try {
    result = await setUserMediaFavorite({ userId: user.id, media, isFavorite });
  } catch (error) {
    console.error(error);
    return { error: TRACKING_FAILED_MESSAGE };
  }

  return {
    isFavorite: result.entry?.isFavorite ?? false,
    created: result.created,
  };
}

export async function setStatus(input: StatusInput): Promise<StatusState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: SIGN_IN_REQUIRED_MESSAGE, redirectTo: SIGN_IN_PATH };
  }

  const parsed = statusSchema.safeParse(input);

  if (!parsed.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  const ref = toMediaRef(parsed.data.mediaKey);

  if (!ref.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  let media: MediaInput;

  try {
    media = await resolveMedia(ref.data);
  } catch {
    return { error: MEDIA_UNAVAILABLE_MESSAGE };
  }

  try {
    const { entry, previousStatus } = await setUserMediaStatus({
      userId: user.id,
      media,
      status: parsed.data.status,
    });

    return { status: entry.status, previousStatus };
  } catch (error) {
    console.error(error);
    return { error: TRACKING_FAILED_MESSAGE };
  }
}

const ratingSchema = z.object({
  mediaKey: z.string(),
  rating: z
    .number()
    .int()
    .min(MEDIA_RATING_MIN)
    .max(MEDIA_RATING_STARS)
    .nullable(),
});

export type RatingInput = z.input<typeof ratingSchema>;

export type RatingState = {
  error?: string;
  redirectTo?: string;
  rating?: number | null;
  created?: boolean;
};

const watchSchema = z.object({
  mediaKey: z.string(),
  delta: z.union([z.literal(1), z.literal(-1)]),
});

export type WatchInput = z.input<typeof watchSchema>;

export type WatchState = {
  error?: string;
  redirectTo?: string;
  watches?: number;
};

export async function setRating(input: RatingInput): Promise<RatingState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: SIGN_IN_REQUIRED_MESSAGE, redirectTo: SIGN_IN_PATH };
  }

  const parsed = ratingSchema.safeParse(input);

  if (!parsed.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  const ref = toMediaRef(parsed.data.mediaKey);

  if (!ref.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  let media: MediaInput;

  try {
    media = await resolveMedia(ref.data);
  } catch {
    return { error: MEDIA_UNAVAILABLE_MESSAGE };
  }

  try {
    const result = await setUserMediaRating({
      userId: user.id,
      media,
      rating: parsed.data.rating,
    });

    return {
      rating: result.entry?.rating ?? null,
      created: result.created,
    };
  } catch (error) {
    console.error(error);
    return { error: TRACKING_FAILED_MESSAGE };
  }
}

export async function adjustWatches(input: WatchInput): Promise<WatchState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: SIGN_IN_REQUIRED_MESSAGE, redirectTo: SIGN_IN_PATH };
  }

  const parsed = watchSchema.safeParse(input);

  if (!parsed.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  const ref = toMediaRef(parsed.data.mediaKey);

  if (!ref.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  if (parsed.data.delta < 0) {
    try {
      const { watches } = await removeUserMediaWatch({
        userId: user.id,
        key: ref.data,
      });

      return { watches };
    } catch (error) {
      console.error(error);
      return { error: TRACKING_FAILED_MESSAGE };
    }
  }

  let media: MediaInput;

  try {
    media = await resolveMedia(ref.data);
  } catch {
    return { error: MEDIA_UNAVAILABLE_MESSAGE };
  }

  try {
    const { watches } = await addUserMediaWatch({ userId: user.id, media });

    return { watches };
  } catch (error) {
    console.error(error);
    return { error: TRACKING_FAILED_MESSAGE };
  }
}

const episodeSchema = z.object({
  mediaKey: z.string(),
  seasonNumber: z.number().int().min(FIRST_SEASON_NUMBER),
  episodeNumber: z.number().int().min(FIRST_SEASON_NUMBER),
  watched: z.boolean(),
});

export type EpisodeInput = z.input<typeof episodeSchema>;

export type EpisodeState = {
  error?: string;
  redirectTo?: string;
  watched?: number;
};

export async function setEpisodeWatched(
  input: EpisodeInput,
): Promise<EpisodeState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: SIGN_IN_REQUIRED_MESSAGE, redirectTo: SIGN_IN_PATH };
  }

  const parsed = episodeSchema.safeParse(input);

  if (!parsed.success) {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  const ref = toMediaRef(parsed.data.mediaKey);

  if (!ref.success || ref.data.type !== "TV_SHOW") {
    return { error: TRACKING_FAILED_MESSAGE };
  }

  let media: MediaInput;

  try {
    media = await resolveMedia(ref.data);
  } catch {
    return { error: MEDIA_UNAVAILABLE_MESSAGE };
  }

  try {
    const { watched } = await setUserMediaEpisode({
      userId: user.id,
      media,
      seasonNumber: parsed.data.seasonNumber,
      episodeNumber: parsed.data.episodeNumber,
      watched: parsed.data.watched,
    });

    return { watched };
  } catch (error) {
    console.error(error);
    return { error: TRACKING_FAILED_MESSAGE };
  }
}
