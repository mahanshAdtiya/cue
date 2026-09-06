import { getCurrentUser } from "@/lib/auth/session";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import {
  countUserMediaWatches,
  findUserMediaByExternalIds,
  listWatchedEpisodes,
  type WatchedEpisode,
} from "@/lib/db/user-media";
import { mediaKey } from "@/lib/media/display";
import type { MediaSummary } from "@/lib/tmdb/media";

export type Tracked<T extends MediaSummary> = T & {
  isFavorite: boolean;
  status: UserMediaStatus | null;
};

export type TrackedMedia = Tracked<MediaSummary>;

const UNTRACKED = { isFavorite: false, status: null } as const;

export async function withTracking<T extends MediaSummary>(
  items: T[],
): Promise<Tracked<T>[]> {
  const user = await getCurrentUser();

  if (!user || items.length === 0) {
    return items.map((item) => ({ ...item, ...UNTRACKED }));
  }

  const entries = await findUserMediaByExternalIds(
    user.id,
    items.map(({ externalId, type }) => ({ externalId, type })),
  );

  const tracked = new Map(entries.map((entry) => [mediaKey(entry), entry]));

  return items.map((item) => {
    const entry = tracked.get(mediaKey(item));

    if (!entry) return { ...item, ...UNTRACKED };

    return { ...item, isFavorite: entry.isFavorite, status: entry.status };
  });
}

export type TitleTracked<T extends MediaSummary> = Tracked<T> & {
  rating: number | null;
  currentSeason: number | null;
  currentEpisode: number | null;
  watches: number;
  watchedEpisodes: WatchedEpisode[];
};

const NO_EPISODES: WatchedEpisode[] = [];

const UNRATED = {
  rating: null,
  currentSeason: null,
  currentEpisode: null,
} as const;

export async function withTitleTracking<T extends MediaSummary>(
  item: T,
): Promise<TitleTracked<T>> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...item,
      ...UNTRACKED,
      ...UNRATED,
      watches: 0,
      watchedEpisodes: NO_EPISODES,
    };
  }

  const key = { externalId: item.externalId, type: item.type };

  const [entries, watches, watchedEpisodes] = await Promise.all([
    findUserMediaByExternalIds(user.id, [key]),
    countUserMediaWatches(user.id, key),
    item.type === "TV_SHOW"
      ? listWatchedEpisodes(user.id, key)
      : NO_EPISODES,
  ]);

  const entry = entries.at(0);

  if (!entry) {
    return { ...item, ...UNTRACKED, ...UNRATED, watches, watchedEpisodes };
  }

  return {
    ...item,
    isFavorite: entry.isFavorite,
    status: entry.status,
    rating: entry.rating,
    currentSeason: entry.currentSeason,
    currentEpisode: entry.currentEpisode,
    watches,
    watchedEpisodes,
  };
}
