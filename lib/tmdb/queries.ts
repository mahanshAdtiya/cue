import "server-only";

import {
  EXPLORE_MARQUEE_SIZE,
  EXPLORE_UPCOMING_FORTNIGHT_DAYS,
  EXPLORE_UPCOMING_SIZE,
  TMDB_FIRST_PAGE,
  TMDB_MAX_PAGE,
  TMDB_MOVIE_APPEND,
  TMDB_RAIL_SIZE,
  TMDB_REVALIDATE_LONG_S,
  TMDB_REVALIDATE_SHORT_S,
  TMDB_SEARCH_ATTEMPTS,
  DAY_MS,
  TMDB_ANIME_GENRE_ID,
  TMDB_ANIME_LANGUAGE,
  TMDB_MIN_VOTES,
  TMDB_SORT_POPULARITY,
  TMDB_SORT_RATING,
  TMDB_TRENDING_WINDOW,
  TMDB_TV_APPEND,
  TMDB_UPCOMING_CANDIDATES,
  type ExploreFilter,
} from "@/lib/constants";
import { daysUntil, isoDate } from "@/lib/time";
import type { MediaType } from "@/lib/db/schema/media";
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
  toEpisodes,
  toUpcomingEpisode,
  type EpisodeSummary,
  type TmdbSeasonDetails,
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

type DiscoverParams = Record<string, string | number | boolean>;

function animeParams(filter: ExploreFilter): DiscoverParams {
  return filter === "anime"
    ? {
        with_genres: TMDB_ANIME_GENRE_ID,
        with_original_language: TMDB_ANIME_LANGUAGE,
      }
    : {};
}

function discover(
  type: MediaType,
  params: DiscoverParams,
  tag: string,
): Promise<MediaSummary[]> {
  const path = type === "MOVIE" ? "/discover/movie" : "/discover/tv";

  return tmdbFetch<TmdbPaged<TmdbSearchResult>>(path, {
    params,
    revalidate: TMDB_REVALIDATE_SHORT_S,
    tags: [tag],
  }).then((page) => toTypedMediaSummaries(page, type));
}

function byRating(a: MediaSummary, b: MediaSummary): number {
  return (b.voteAverage ?? 0) - (a.voteAverage ?? 0);
}

function byPopularity(a: MediaSummary, b: MediaSummary): number {
  return (b.popularity ?? 0) - (a.popularity ?? 0);
}

export async function getTrending(
  filter: ExploreFilter = "all",
): Promise<MediaSummary[]> {
  if (filter === "anime") {
    const params = { sort_by: TMDB_SORT_POPULARITY, ...animeParams(filter) };
    const [movies, shows] = await Promise.all([
      discover("MOVIE", params, "tmdb:trending"),
      discover("TV_SHOW", params, "tmdb:trending"),
    ]);

    return [...movies, ...shows].sort(byPopularity).slice(0, TMDB_RAIL_SIZE);
  }

  if (filter === "movies" || filter === "shows") {
    const type = filter === "movies" ? "movie" : "tv";
    const page = await tmdbFetch<TmdbPaged<TmdbSearchResult>>(
      `/trending/${type}/${TMDB_TRENDING_WINDOW}`,
      { revalidate: TMDB_REVALIDATE_SHORT_S, tags: ["tmdb:trending"] },
    );

    return toTypedMediaSummaries(
      page,
      filter === "movies" ? "MOVIE" : "TV_SHOW",
    ).slice(0, TMDB_RAIL_SIZE);
  }

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

export async function getTopRated(
  filter: ExploreFilter = "all",
): Promise<MediaSummary[]> {
  const params = {
    sort_by: TMDB_SORT_RATING,
    "vote_count.gte": TMDB_MIN_VOTES,
    ...animeParams(filter),
  };

  const wanted: MediaType[] =
    filter === "movies"
      ? ["MOVIE"]
      : filter === "shows"
        ? ["TV_SHOW"]
        : ["MOVIE", "TV_SHOW"];

  const lists = await Promise.all(
    wanted.map((type) => discover(type, params, "tmdb:top-rated")),
  );

  return lists.flat().sort(byRating).slice(0, TMDB_RAIL_SIZE);
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
    params: { append_to_response: TMDB_MOVIE_APPEND },
    revalidate: TMDB_REVALIDATE_LONG_S,
    tags: [`tmdb:movie:${externalId}`],
  });

  return toMovieDetails(raw);
}

async function getTvRaw(id: string | number): Promise<TmdbTvDetails> {
  const externalId = tmdbId(id);
  return tmdbFetch<TmdbTvDetails>(`/tv/${externalId}`, {
    params: { append_to_response: TMDB_TV_APPEND },
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

async function upcomingCandidates(
  filter: ExploreFilter,
): Promise<TmdbSearchResult[]> {
  if (filter === "anime") {
    const today = new Date();
    const page = await tmdbFetch<TmdbPaged<TmdbSearchResult>>("/discover/tv", {
      params: {
        sort_by: TMDB_SORT_POPULARITY,
        "air_date.gte": isoDate(today),
        "air_date.lte": isoDate(
          new Date(today.getTime() + EXPLORE_UPCOMING_FORTNIGHT_DAYS * DAY_MS),
        ),
        ...animeParams(filter),
      },
      revalidate: TMDB_REVALIDATE_SHORT_S,
      tags: ["tmdb:on-the-air"],
    });

    return page.results ?? [];
  }

  const page = await tmdbFetch<TmdbPaged<TmdbSearchResult>>("/tv/on_the_air", {
    revalidate: TMDB_REVALIDATE_SHORT_S,
    tags: ["tmdb:on-the-air"],
  });

  return page.results ?? [];
}

export async function getUpcomingEpisodes(
  filter: ExploreFilter = "all",
): Promise<UpcomingEpisode[]> {
  if (filter === "movies") return [];

  const candidates = (await upcomingCandidates(filter)).slice(
    0,
    TMDB_UPCOMING_CANDIDATES,
  );

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

export async function getSeasonEpisodes(
  id: string | number,
  seasonNumber: number,
): Promise<EpisodeSummary[]> {
  const externalId = tmdbId(id);

  const raw = await tmdbFetch<TmdbSeasonDetails>(
    `/tv/${externalId}/season/${seasonNumber}`,
    {
      revalidate: TMDB_REVALIDATE_SHORT_S,
      tags: [`tmdb:tv:${externalId}:season:${seasonNumber}`],
    },
  );

  return toEpisodes(raw, seasonNumber);
}
