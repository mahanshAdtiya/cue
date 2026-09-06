"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import {
  MEDIA_KEY_SEPARATOR,
  MEDIA_UNAVAILABLE_MESSAGE,
  SIGN_IN_PATH,
  SIGN_IN_REQUIRED_MESSAGE,
  TRACKING_FAILED_MESSAGE,
} from "@/lib/constants";
import { mediaType } from "@/lib/db/schema/media";
import {
  findMediaByExternalId,
  setUserMediaFavorite,
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

type MediaRef = z.infer<typeof mediaRefSchema>;

function toMediaRef(mediaKey: string) {
  const [type, externalId] = mediaKey.split(MEDIA_KEY_SEPARATOR);
  return mediaRefSchema.safeParse({ type, externalId });
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
    description: details.description,
    releaseDate: details.releaseDate,
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
