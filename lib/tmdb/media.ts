import "server-only";

import {
  TMDB_BACKDROP_CARD_SIZE,
  TMDB_BACKDROP_SIZE,
  TMDB_CERTIFICATION_REGION,
  TMDB_POSTER_SIZE,
  TMDB_PROFILE_SIZE,
  FIRST_SEASON_NUMBER,
  TITLE_CAST_LIMIT,
  TITLE_CREDIT_CREATED_BY,
  TITLE_CREDIT_NETWORK,
  TITLE_CREDIT_ROLE_LIMIT,
  TITLE_CREDIT_STUDIO,
  MOVIE_CREDIT_ROLES,
  UNTITLED_MEDIA_TITLE,
} from "@/lib/constants";
import type { MediaType } from "@/lib/db/schema/media";

type TmdbGenre = { id: number; name: string };

type TmdbNamed = { name?: string };

type TmdbLanguage = { english_name?: string; name?: string };

type TmdbCastMember = {
  id: number;
  name?: string;
  character?: string;
  profile_path?: string | null;
};

type TmdbCrewMember = {
  id: number;
  name?: string;
  job?: string;
};

type TmdbCredits = {
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
};

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
  vote_count?: number;
  popularity?: number;
  spoken_languages?: TmdbLanguage[];
  production_countries?: TmdbNamed[];
  production_companies?: TmdbNamed[];
  credits?: TmdbCredits;
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
  release_dates?: {
    results?: {
      iso_3166_1?: string;
      release_dates?: { certification?: string }[];
    }[];
  };
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
  seasons?: { season_number?: number; episode_count?: number }[];
  created_by?: TmdbNamed[];
  networks?: TmdbNamed[];
  content_ratings?: {
    results?: { iso_3166_1?: string; rating?: string }[];
  };
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
  voteAverage: number | null;
  popularity: number | null;
};

export type UpcomingEpisode = {
  media: MediaSummary;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string;
};

export type CastMember = {
  id: string;
  name: string;
  role: string | null;
  profileUrl: string | null;
};

export type CreditRow = {
  label: string;
  names: string[];
};

export type SeasonSummary = {
  number: number;
  episodeCount: number;
};

export type EpisodeSummary = {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string | null;
};

export type TmdbSeasonDetails = {
  season_number?: number;
  episodes?: {
    episode_number?: number;
    season_number?: number;
    name?: string;
    air_date?: string | null;
  }[];
};

export type NextEpisode = {
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
  voteCount: number | null;
  certification: string | null;
  languages: string[];
  countries: string[];
  cast: CastMember[];
  credits: CreditRow[];
  seasons: SeasonSummary[];
  nextEpisode: NextEpisode | null;
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

export function profileUrl(path: string | null | undefined): string | null {
  return imageUrl(path, TMDB_PROFILE_SIZE);
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function yearOf(releaseDate: string | null): number | null {
  if (!releaseDate) return null;
  const year = Number(releaseDate.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

function genreIdsOf(raw: TmdbShared): number[] {
  if (raw.genre_ids) return raw.genre_ids;
  return (raw.genres ?? []).map((genre) => genre.id);
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
    voteAverage: raw.vote_average ?? null,
    popularity: raw.popularity ?? null,
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

function namesOf(items: TmdbNamed[] | undefined): string[] {
  return (items ?? [])
    .map((item) => nonEmpty(item.name))
    .filter((name): name is string => name !== null);
}

function languageNames(raw: TmdbShared): string[] {
  return (raw.spoken_languages ?? [])
    .map((language) => nonEmpty(language.english_name ?? language.name))
    .filter((name): name is string => name !== null);
}

function toCast(raw: TmdbShared): CastMember[] {
  return (raw.credits?.cast ?? []).slice(0, TITLE_CAST_LIMIT).map((member) => ({
    id: String(member.id),
    name: nonEmpty(member.name) ?? UNTITLED_MEDIA_TITLE,
    role: nonEmpty(member.character),
    profileUrl: profileUrl(member.profile_path),
  }));
}

function creditRow(label: string, names: string[]): CreditRow | null {
  const unique = [...new Set(names)].slice(0, TITLE_CREDIT_ROLE_LIMIT);
  return unique.length ? { label, names: unique } : null;
}

function crewNames(raw: TmdbShared, jobs: readonly string[]): string[] {
  return (raw.credits?.crew ?? [])
    .filter((member) => member.job !== undefined && jobs.includes(member.job))
    .map((member) => nonEmpty(member.name))
    .filter((name): name is string => name !== null);
}

function movieCredits(raw: TmdbMovieDetails): CreditRow[] {
  const roles = MOVIE_CREDIT_ROLES.map((role) =>
    creditRow(role.label, crewNames(raw, role.jobs)),
  );

  return [
    ...roles,
    creditRow(TITLE_CREDIT_STUDIO, namesOf(raw.production_companies)),
  ].filter((row): row is CreditRow => row !== null);
}

function tvCredits(raw: TmdbTvDetails): CreditRow[] {
  return [
    creditRow(TITLE_CREDIT_CREATED_BY, namesOf(raw.created_by)),
    creditRow(TITLE_CREDIT_NETWORK, namesOf(raw.networks)),
    creditRow(TITLE_CREDIT_STUDIO, namesOf(raw.production_companies)),
  ].filter((row): row is CreditRow => row !== null);
}

function movieCertification(raw: TmdbMovieDetails): string | null {
  const region = (raw.release_dates?.results ?? []).find(
    (entry) => entry.iso_3166_1 === TMDB_CERTIFICATION_REGION,
  );

  for (const release of region?.release_dates ?? []) {
    const certification = nonEmpty(release.certification);
    if (certification) return certification;
  }

  return null;
}

function tvCertification(raw: TmdbTvDetails): string | null {
  const region = (raw.content_ratings?.results ?? []).find(
    (entry) => entry.iso_3166_1 === TMDB_CERTIFICATION_REGION,
  );

  return nonEmpty(region?.rating);
}

function toSeasons(raw: TmdbTvDetails): SeasonSummary[] {
  return (raw.seasons ?? [])
    .filter((season) => (season.season_number ?? 0) >= FIRST_SEASON_NUMBER)
    .map((season) => ({
      number: season.season_number ?? FIRST_SEASON_NUMBER,
      episodeCount: season.episode_count ?? 0,
    }))
    .sort((a, b) => a.number - b.number);
}

function toNextEpisode(raw: TmdbTvDetails): NextEpisode | null {
  const next = raw.next_episode_to_air;
  const airDate = nonEmpty(next?.air_date);

  if (!next || !airDate) return null;
  if (typeof next.season_number !== "number") return null;
  if (typeof next.episode_number !== "number") return null;

  return {
    seasonNumber: next.season_number,
    episodeNumber: next.episode_number,
    airDate,
  };
}

function sharedDetails(raw: TmdbShared) {
  return {
    genres: genreNames(raw),
    voteCount: raw.vote_count ?? null,
    languages: languageNames(raw),
    countries: namesOf(raw.production_countries),
    cast: toCast(raw),
  };
}

export function toMovieDetails(raw: TmdbMovieDetails): MediaDetails {
  return {
    ...toSummary("MOVIE", raw),
    ...sharedDetails(raw),
    runtimeMinutes: raw.runtime ?? null,
    seasonCount: null,
    episodeCount: null,
    status: nonEmpty(raw.status),
    inProduction: null,
    certification: movieCertification(raw),
    credits: movieCredits(raw),
    seasons: [],
    nextEpisode: null,
  };
}

export function toTvDetails(raw: TmdbTvDetails): MediaDetails {
  return {
    ...toSummary("TV_SHOW", raw),
    ...sharedDetails(raw),
    runtimeMinutes: null,
    seasonCount: raw.number_of_seasons ?? null,
    episodeCount: raw.number_of_episodes ?? null,
    status: nonEmpty(raw.status),
    inProduction: raw.in_production ?? null,
    certification: tvCertification(raw),
    credits: tvCredits(raw),
    seasons: toSeasons(raw),
    nextEpisode: toNextEpisode(raw),
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

export function toEpisodes(
  raw: TmdbSeasonDetails,
  seasonNumber: number,
): EpisodeSummary[] {
  return (raw.episodes ?? [])
    .filter((episode) => typeof episode.episode_number === "number")
    .map((episode) => ({
      seasonNumber: episode.season_number ?? seasonNumber,
      episodeNumber: episode.episode_number as number,
      title: nonEmpty(episode.name) ?? UNTITLED_MEDIA_TITLE,
      airDate: nonEmpty(episode.air_date),
    }))
    .sort((a, b) => a.episodeNumber - b.episodeNumber);
}
