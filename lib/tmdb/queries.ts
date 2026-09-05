import "server-only";

import {
  EXPLORE_MARQUEE_SIZE,
  EXPLORE_UPCOMING_FORTNIGHT_DAYS,
  EXPLORE_UPCOMING_SIZE,
  TMDB_FIRST_PAGE,
  TMDB_MAX_PAGE,
  TMDB_RAIL_SIZE,
  TMDB_REVALIDATE_LONG_S,
  TMDB_REVALIDATE_SHORT_S,
  TMDB_SEARCH_ATTEMPTS,
  TMDB_TRENDING_WINDOW,
  TMDB_UPCOMING_CANDIDATES,
} from "@/lib/constants";
import { daysUntil } from "@/lib/time";
import { tmdbFetch } from "@/lib/tmdb/client";
import {
  toMediaSummaries,
  toMovieDetails,
  toTvDetails,
  toTypedMediaSummaries,
  type MediaDetails,
  type MediaSummary,
  type TmdbMovieDetails,
  type TmdbPaged,
  type TmdbSearchResult,
  toUpcomingEpisode,
  type TmdbTvDetails,
  type UpcomingEpisode,
} from "@/lib/tmdb/media";

export type MediaPage = {
  items: MediaSummary[];
  page: number;
  totalPages: number;
  totalResults: number;
};

const EMPTY_PAGE: MediaPage = {
  items: [],
  page: TMDB_FIRST_PAGE,
  totalPages: 0,
  totalResults: 0,
};

function tmdbId(id: string | number): string {
  const value = String(id);
  if (!/^\d+$/.test(value)) {
    throw new Error(`TMDB id must be digits only, got "${value}".`);
  }
  return value;
}

function clampPage(page: number): number {
  if (!Number.isInteger(page)) return TMDB_FIRST_PAGE;
  return Math.min(Math.max(page, TMDB_FIRST_PAGE), TMDB_MAX_PAGE);
}

export async function getTrending(): Promise<MediaSummary[]> {
  const page = await tmdbFetch<TmdbPaged<TmdbSearchResult>>(
    `/trending/all/${TMDB_TRENDING_WINDOW}`,
    { revalidate: TMDB_REVALIDATE_SHORT_S, tags: ["tmdb:trending"] },
  );

  return toMediaSummaries(page).slice(0, TMDB_RAIL_SIZE);
}

export async function getNowPlaying(): Promise<MediaSummary[]> {
  const page = await tmdbFetch<TmdbPaged<TmdbSearchResult>>(
    "/movie/now_playing",
    { revalidate: TMDB_REVALIDATE_SHORT_S, tags: ["tmdb:now-playing"] },
  );

  return toTypedMediaSummaries(page, "MOVIE").slice(0, TMDB_RAIL_SIZE);
}

export async function getTopRated(): Promise<MediaSummary[]> {
  const [movies, shows] = await Promise.all([
    tmdbFetch<TmdbPaged<TmdbSearchResult>>("/movie/top_rated", {
      revalidate: TMDB_REVALIDATE_SHORT_S,
      tags: ["tmdb:top-rated"],
    }),
    tmdbFetch<TmdbPaged<TmdbSearchResult>>("/tv/top_rated", {
      revalidate: TMDB_REVALIDATE_SHORT_S,
      tags: ["tmdb:top-rated"],
    }),
  ]);

  return [
    ...toTypedMediaSummaries(movies, "MOVIE"),
    ...toTypedMediaSummaries(shows, "TV_SHOW"),
  ]
    .sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0))
    .slice(0, TMDB_RAIL_SIZE);
}

export async function searchMedia(
  query: string,
  page = TMDB_FIRST_PAGE,
): Promise<MediaPage> {
  const term = query.trim();
  if (!term) return EMPTY_PAGE;

  const result = await tmdbFetch<TmdbPaged<TmdbSearchResult>>("/search/multi", {
    params: { query: term, include_adult: false, page: clampPage(page) },
    revalidate: TMDB_REVALIDATE_SHORT_S,
    tags: ["tmdb:search"],
    attempts: TMDB_SEARCH_ATTEMPTS,
  });

  return {
    items: toMediaSummaries(result),
    page: result.page,
    totalPages: Math.min(result.total_pages, TMDB_MAX_PAGE),
    totalResults: result.total_results,
  };
}

export async function getMovieDetails(
  id: string | number,
): Promise<MediaDetails> {
  const externalId = tmdbId(id);
  const raw = await tmdbFetch<TmdbMovieDetails>(`/movie/${externalId}`, {
    revalidate: TMDB_REVALIDATE_LONG_S,
    tags: [`tmdb:movie:${externalId}`],
  });

  return toMovieDetails(raw);
}

async function getTvRaw(id: string | number): Promise<TmdbTvDetails> {
  const externalId = tmdbId(id);
  return tmdbFetch<TmdbTvDetails>(`/tv/${externalId}`, {
    revalidate: TMDB_REVALIDATE_LONG_S,
    tags: [`tmdb:tv:${externalId}`],
  });
}

export async function getTvDetails(
  id: string | number,
): Promise<MediaDetails> {
  return toTvDetails(await getTvRaw(id));
}

export async function getMediaDetails(
  item: MediaSummary,
): Promise<MediaDetails> {
  return item.type === "MOVIE"
    ? getMovieDetails(item.externalId)
    : getTvDetails(item.externalId);
}

export async function getUpcomingEpisodes(): Promise<UpcomingEpisode[]> {
  const page = await tmdbFetch<TmdbPaged<TmdbSearchResult>>("/tv/on_the_air", {
    revalidate: TMDB_REVALIDATE_SHORT_S,
    tags: ["tmdb:on-the-air"],
  });

  const candidates = (page.results ?? []).slice(0, TMDB_UPCOMING_CANDIDATES);
  const settled = await Promise.allSettled(
    candidates.map((show) => getTvRaw(show.id)),
  );

  return settled
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .map((raw) => (raw ? toUpcomingEpisode(raw) : null))
    .filter((episode): episode is UpcomingEpisode => episode !== null)
    .filter((episode) => {
      const days = daysUntil(episode.airDate);
      return days !== null && days >= 0 && days <= EXPLORE_UPCOMING_FORTNIGHT_DAYS;
    })
    .sort((a, b) => a.airDate.localeCompare(b.airDate))
    .slice(0, EXPLORE_UPCOMING_SIZE);
}

export async function getMarquee(): Promise<MediaDetails[]> {
  const trending = await getTrending();
  const settled = await Promise.allSettled(
    trending.slice(0, EXPLORE_MARQUEE_SIZE).map(getMediaDetails),
  );

  return settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}
