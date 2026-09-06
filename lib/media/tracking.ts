import { getCurrentUser } from "@/lib/auth/session";
import { findUserMediaByExternalIds } from "@/lib/db/user-media";
import { mediaKey } from "@/lib/media/display";
import type { MediaSummary } from "@/lib/tmdb/media";

export type Tracked<T extends MediaSummary> = T & { isFavorite: boolean };

export type TrackedMedia = Tracked<MediaSummary>;

export async function withFavorites<T extends MediaSummary>(
  items: T[],
): Promise<Tracked<T>[]> {
  const user = await getCurrentUser();

  if (!user || items.length === 0) {
    return items.map((item) => ({ ...item, isFavorite: false }));
  }

  const entries = await findUserMediaByExternalIds(
    user.id,
    items.map(({ externalId, type }) => ({ externalId, type })),
  );

  const favorited = new Set(
    entries.filter((entry) => entry.isFavorite).map(mediaKey),
  );

  return items.map((item) => ({
    ...item,
    isFavorite: favorited.has(mediaKey(item)),
  }));
}
