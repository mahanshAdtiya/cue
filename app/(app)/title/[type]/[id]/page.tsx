import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TitleBackdrop } from "@/components/title/title-backdrop";
import { TitleCast } from "@/components/title/title-cast";
import { TitleCredits } from "@/components/title/title-credits";
import { TitleEpisodes } from "@/components/title/title-episodes";
import { TitleEpisodesSkeleton } from "@/components/title/title-episodes-skeleton";
import { TitleFacts } from "@/components/title/title-facts";
import { TitleHero } from "@/components/title/title-hero";
import type { TitleProgress } from "@/components/title/title-tracking";
import {
  FIRST_SEASON_NUMBER,
  TITLE_SEASON_PARAM,
  TMDB_NOT_FOUND_STATUS,
} from "@/lib/constants";
import type { MediaType } from "@/lib/db/schema/media";
import {
  episodeCode,
  episodeTotal,
  hueOf,
  mediaTypeFromSegment,
  nextUnwatched,
} from "@/lib/media/display";
import { toDetailsHero, toHeroTracking } from "@/lib/media/hero";
import { withTitleTracking, type TitleTracked } from "@/lib/media/tracking";
import { TmdbError } from "@/lib/tmdb/client";
import type { MediaDetails } from "@/lib/tmdb/media";
import {
  getMovieDetails,
  getSeasonEpisodes,
  getTvDetails,
} from "@/lib/tmdb/queries";

async function findDetails(
  type: MediaType,
  externalId: string,
): Promise<MediaDetails | null> {
  try {
    return type === "MOVIE"
      ? await getMovieDetails(externalId)
      : await getTvDetails(externalId);
  } catch (error) {
    if (error instanceof TmdbError && error.status === TMDB_NOT_FOUND_STATUS) {
      return null;
    }
    throw error;
  }
}

async function resolve(
  params: PageProps<"/title/[type]/[id]">["params"],
): Promise<MediaDetails> {
  const { type, id } = await params;

  const mediaType = mediaTypeFromSegment(type);
  if (!mediaType || !/^\d+$/.test(id)) notFound();

  const details = await findDetails(mediaType, id);
  if (!details) notFound();

  return details;
}

function progressOf(item: TitleTracked<MediaDetails>): TitleProgress | null {
  if (item.type === "MOVIE") return null;

  const total = episodeTotal(item);
  if (total === 0) return null;

  const next = nextUnwatched(item, item.watchedEpisodes);

  return {
    watched: item.watchedEpisodes.length,
    total,
    position: next ? episodeCode(next.seasonNumber, next.episodeNumber) : null,
  };
}

function toSeason(
  details: MediaDetails,
  value: string | string[] | undefined,
): number {
  const wanted = Number(Array.isArray(value) ? value[0] : value);
  const match = details.seasons.find((season) => season.number === wanted);

  return match?.number ?? details.seasons.at(0)?.number ?? FIRST_SEASON_NUMBER;
}

async function EpisodesSection({
  details,
  season,
  watched,
}: {
  details: MediaDetails;
  season: number;
  watched: number[];
}) {
  return (
    <TitleEpisodes
      details={details}
      season={season}
      episodes={await getSeasonEpisodes(details.externalId, season)}
      watched={watched}
    />
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/title/[type]/[id]">): Promise<Metadata> {
  const details = await resolve(params);

  return {
    title: details.title,
    description: details.description ?? undefined,
  };
}

export default async function Title({
  params,
  searchParams,
}: PageProps<"/title/[type]/[id]">) {
  const details = await resolve(params);
  const item = await withTitleTracking(details);
  const season = toSeason(details, (await searchParams)[TITLE_SEASON_PARAM]);

  const watchedInSeason = item.watchedEpisodes
    .filter((episode) => episode.seasonNumber === season)
    .map((episode) => episode.episodeNumber);

  return (
    <main className="relative flex w-full flex-1 flex-col pb-16">
      <TitleBackdrop src={item.backdropUrl} hue={hueOf(item.externalId)} />

      <div className="px-pad relative z-[1] mx-auto w-full max-w-[1440px]">
        <TitleHero
          media={toDetailsHero(item)}
          tracking={toHeroTracking(item, {
            status: item.status,
            isFavorite: item.isFavorite,
            rating: item.rating,
            watches: item.watches,
            progress: progressOf(item),
          })}
        />

        <TitleFacts details={details} />

        <div className="flex flex-col gap-[clamp(30px,4vw,52px)] pt-[clamp(30px,4vw,52px)]">
          {details.seasons.length > 0 ? (
            <Suspense key={season} fallback={<TitleEpisodesSkeleton />}>
              <EpisodesSection
                details={details}
                season={season}
                watched={watchedInSeason}
              />
            </Suspense>
          ) : null}
          <TitleCredits credits={details.credits} />
          <TitleCast cast={details.cast} />
        </div>
      </div>
    </main>
  );
}
