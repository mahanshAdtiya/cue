import "server-only";

import {
  TMDB_ANIME_GENRE_ID,
  TMDB_ANIME_LANGUAGE,
  TMDB_BACKDROP_CARD_SIZE,
  TMDB_BACKDROP_SIZE,
  TMDB_POSTER_SIZE,
  UNTITLED_MEDIA_TITLE,
} from "@/lib/constants";
import type { MediaType } from "@/lib/db/schema/media";

type TmdbGenre = { id: number; name: string };

type TmdbShared = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  genres?: TmdbGenre[];
  original_language?: string;
  vote_average?: number;
};

export type TmdbSearchResult = TmdbShared & {
  media_type?: string;
};

export type TmdbPaged<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbMovieDetails = TmdbShared & {
  title: string;
  runtime?: number | null;
  status?: string;
};

type TmdbEpisode = {
  season_number?: number | null;
  episode_number?: number | null;
  air_date?: string | null;
};

export type TmdbTvDetails = TmdbShared & {
  name: string;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  in_production?: boolean;
  status?: string;
  next_episode_to_air?: TmdbEpisode | null;
};

export type MediaSummary = {
  externalId: string;
  type: MediaType;
  title: string;
  originalTitle: string | null;
  description: string | null;
  releaseDate: string | null;
  year: number | null;
  posterPath: string | null;
  posterUrl: string | null;
  backdropPath: string | null;
  backdropUrl: string | null;
  backdropCardUrl: string | null;
  isAnime: boolean;
  voteAverage: number | null;
};

export type UpcomingEpisode = {
  media: MediaSummary;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string;
};

export type MediaDetails = MediaSummary & {
  genres: string[];
  runtimeMinutes: number | null;
  seasonCount: number | null;
  episodeCount: number | null;
  status: string | null;
  inProduction: boolean | null;
};

function imageUrl(path: string | null | undefined, size: string): string | null {
  if (!path) return null;
  const base = process.env.TMDB_IMAGE_BASE;
  if (!base) {
    throw new Error("Missing environment variable TMDB_IMAGE_BASE. See .env.example.");
  }
  return `${base.replace(/\/+$/, "")}/${size}${path}`;
}

export function posterUrl(path: string | null | undefined): string | null {
  return imageUrl(path, TMDB_POSTER_SIZE);
}

export function backdropUrl(path: string | null | undefined): string | null {
  return imageUrl(path, TMDB_BACKDROP_SIZE);
}

export function backdropCardUrl(path: string | null | undefined): string | null {
  return imageUrl(path, TMDB_BACKDROP_CARD_SIZE);
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function yearOf(releaseDate: string | null): number | null {
  if (!releaseDate) return null;
  const year = Number(releaseDate.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

function genreIdsOf(raw: TmdbShared): number[] {
  if (raw.genre_ids) return raw.genre_ids;
  return (raw.genres ?? []).map((genre) => genre.id);
}

function isAnime(raw: TmdbShared): boolean {
  return (
    genreIdsOf(raw).includes(TMDB_ANIME_GENRE_ID) &&
    raw.original_language === TMDB_ANIME_LANGUAGE
  );
}

export function toMediaType(value: string | undefined): MediaType | null {
  if (value === "movie") return "MOVIE";
  if (value === "tv") return "TV_SHOW";
  return null;
}

function toSummary(type: MediaType, raw: TmdbShared): MediaSummary {
  const releaseDate = nonEmpty(raw.release_date ?? raw.first_air_date);
  const posterPath = nonEmpty(raw.poster_path);
  const backdropPath = nonEmpty(raw.backdrop_path);

  return {
    externalId: String(raw.id),
    type,
    title: nonEmpty(raw.title ?? raw.name) ?? UNTITLED_MEDIA_TITLE,
    originalTitle: nonEmpty(raw.original_title ?? raw.original_name),
    description: nonEmpty(raw.overview),
    releaseDate,
    year: yearOf(releaseDate),
    posterPath,
    posterUrl: posterUrl(posterPath),
    backdropPath,
    backdropUrl: backdropUrl(backdropPath),
    backdropCardUrl: backdropCardUrl(backdropPath),
    isAnime: isAnime(raw),
    voteAverage: raw.vote_average ?? null,
  };
}

export function toMediaSummary(raw: TmdbSearchResult): MediaSummary | null {
  const type = toMediaType(raw.media_type);
  return type ? toSummary(type, raw) : null;
}

export function toMediaSummaries(page: TmdbPaged<TmdbSearchResult>): MediaSummary[] {
  return (page.results ?? [])
    .map(toMediaSummary)
    .filter((item): item is MediaSummary => item !== null);
}

export function toTypedMediaSummaries(
  page: TmdbPaged<TmdbSearchResult>,
  type: MediaType,
): MediaSummary[] {
  return (page.results ?? []).map((result) => toSummary(type, result));
}

function genreNames(raw: TmdbShared): string[] {
  return (raw.genres ?? [])
    .map((genre) => nonEmpty(genre.name))
    .filter((name): name is string => name !== null);
}

export function toMovieDetails(raw: TmdbMovieDetails): MediaDetails {
  return {
    ...toSummary("MOVIE", raw),
    genres: genreNames(raw),
    runtimeMinutes: raw.runtime ?? null,
    seasonCount: null,
    episodeCount: null,
    status: nonEmpty(raw.status),
    inProduction: null,
  };
}

export function toTvDetails(raw: TmdbTvDetails): MediaDetails {
  return {
    ...toSummary("TV_SHOW", raw),
    genres: genreNames(raw),
    runtimeMinutes: null,
    seasonCount: raw.number_of_seasons ?? null,
    episodeCount: raw.number_of_episodes ?? null,
    status: nonEmpty(raw.status),
    inProduction: raw.in_production ?? null,
  };
}

export function toUpcomingEpisode(raw: TmdbTvDetails): UpcomingEpisode | null {
  const next = raw.next_episode_to_air;
  const airDate = nonEmpty(next?.air_date);

  if (!next || !airDate) return null;
  if (typeof next.season_number !== "number") return null;
  if (typeof next.episode_number !== "number") return null;

  return {
    media: toSummary("TV_SHOW", raw),
    seasonNumber: next.season_number,
    episodeNumber: next.episode_number,
    airDate,
  };
}
