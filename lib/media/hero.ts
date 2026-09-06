import type { TitleProgress } from "@/components/title/title-tracking";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import {
  mediaHref,
  mediaKey,
  mediaKindLabel,
  mediaRating,
  titleFacts,
  titleKicker,
} from "@/lib/media/display";
import type { LibraryMedia } from "@/lib/media/library";
import type { MediaDetails } from "@/lib/tmdb/media";
import type { TitleTracked } from "@/lib/media/tracking";

export type HeroMedia = {
  externalId: string;
  title: string;
  href: string;
  kicker: string;
  facts: string[];
  rating: string | null;
  synopsis: string | null;
  posterUrl: string | null;
};

export type HeroTracking = {
  mediaKey: string;
  status: UserMediaStatus | null;
  isFavorite: boolean;
  rating: number | null;
  watches: number;
  progress: TitleProgress | null;
};

function heroMedia(
  item: {
    externalId: string;
    title: string;
    posterUrl: string | null;
    description: string | null;
    voteAverage: number | null;
  } & Parameters<typeof mediaHref>[0],
  facts: string[],
  kicker: string,
): HeroMedia {
  return {
    externalId: item.externalId,
    title: item.title,
    href: mediaHref(item),
    kicker,
    facts,
    rating: mediaRating(item),
    synopsis: item.description,
    posterUrl: item.posterUrl,
  };
}

export function toDetailsHero(item: TitleTracked<MediaDetails>): HeroMedia {
  return heroMedia(item, titleFacts(item), titleKicker(item));
}

export function toLibraryHero(item: LibraryMedia, kicker: string): HeroMedia {
  const facts = [mediaKindLabel(item), item.year ? String(item.year) : ""];

  return heroMedia(
    item,
    facts.filter((fact) => fact.length > 0),
    kicker,
  );
}

export function toHeroTracking(
  item: { externalId: string; type: LibraryMedia["type"] },
  tracking: Omit<HeroTracking, "mediaKey">,
): HeroTracking {
  return { mediaKey: mediaKey(item), ...tracking };
}
