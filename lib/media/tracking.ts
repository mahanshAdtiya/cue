import { getCurrentUser } from "@/lib/auth/session";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import { findUserMediaByExternalIds } from "@/lib/db/user-media";
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
