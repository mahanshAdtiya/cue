import {
  MEDIA_EPISODE_CODE,
  MEDIA_EPISODE_UNIT,
  MEDIA_EXTENT_FEATURE,
  MEDIA_GENRE_SEPARATOR,
  MEDIA_HUE_SEED,
  MEDIA_HUE_STEPS,
  MEDIA_KEY_SEPARATOR,
  MEDIA_KIND_LABELS,
  MEDIA_RANK_PAD,
  MEDIA_RATING_DECIMALS,
  MEDIA_RATING_EMPTY_GLYPH,
  MEDIA_RATING_GLYPH,
  MEDIA_RATING_STARS,
  MEDIA_RUNTIME_HOUR_UNIT,
  MEDIA_RUNTIME_MINUTES_PER_HOUR,
  MEDIA_RUNTIME_MINUTE_UNIT,
  MEDIA_SEASON_CODE,
  MEDIA_SEASON_UNIT,
  MEDIA_SEPARATOR,
  MEDIA_TYPE_SEGMENTS,
  FIRST_SEASON_NUMBER,
  DATE_LOCALE,
  TITLE_KICKER_MOVIE_EXTENT,
  TITLE_PROGRESS_COUNT,
  COUNT_TOKEN,
  TOTAL_TOKEN,
} from "@/lib/constants";
import type { MediaType } from "@/lib/db/schema/media";
import type { MediaDetails, MediaSummary } from "@/lib/tmdb/media";

export function hueOf(externalId: string): number {
  let hue = 0;
  for (const char of externalId) {
    hue = (hue * MEDIA_HUE_SEED + char.charCodeAt(0)) % MEDIA_HUE_STEPS;
  }
  return hue;
}

export function mediaKey(item: {
  externalId: string;
  type: MediaType;
}): string {
  return `${item.type}${MEDIA_KEY_SEPARATOR}${item.externalId}`;
}

const MEDIA_TYPES = Object.keys(MEDIA_TYPE_SEGMENTS) as MediaType[];

export function mediaHref(item: {
  externalId: string;
  type: MediaType;
}): string {
  return `/title/${MEDIA_TYPE_SEGMENTS[item.type]}/${item.externalId}`;
}

export function mediaTypeFromSegment(segment: string): MediaType | null {
  const match = MEDIA_TYPES.find(
    (type) => MEDIA_TYPE_SEGMENTS[type] === segment,
  );
  return match ?? null;
}


export function mediaKindLabel(item: { type: MediaType }): string {
  return MEDIA_KIND_LABELS[item.type];
}

export function mediaSub(item: MediaSummary): string {
  return [item.year, mediaKindLabel(item)]
    .filter(Boolean)
    .join(MEDIA_SEPARATOR);
}

export function mediaRating(item: { voteAverage: number | null }): string | null {
  if (!item.voteAverage) return null;
  return `${MEDIA_RATING_GLYPH} ${item.voteAverage.toFixed(MEDIA_RATING_DECIMALS)}`;
}

export function mediaMeta(item: MediaSummary): string {
  return [mediaKindLabel(item), item.year, mediaRating(item)]
    .filter(Boolean)
    .join(MEDIA_SEPARATOR);
}

export function rankLabel(position: number): string {
  return String(position).padStart(MEDIA_RANK_PAD, "0");
}

export function counted(count: number, unit: readonly [string, string]): string {
  return `${count} ${count === 1 ? unit[0] : unit[1]}`;
}

export function mediaExtent(details: MediaDetails): string | null {
  if (details.type === "MOVIE") return MEDIA_EXTENT_FEATURE;

  const parts = [
    details.seasonCount
      ? counted(details.seasonCount, MEDIA_SEASON_UNIT)
      : null,
    details.episodeCount
      ? counted(details.episodeCount, MEDIA_EPISODE_UNIT)
      : null,
  ].filter(Boolean);

  return parts.length ? parts.join(MEDIA_SEPARATOR) : null;
}

export function runtimeLabel(minutes: number | null): string | null {
  if (!minutes) return null;

  const hours = Math.floor(minutes / MEDIA_RUNTIME_MINUTES_PER_HOUR);
  const rest = minutes % MEDIA_RUNTIME_MINUTES_PER_HOUR;

  const parts = [
    hours ? `${hours}${MEDIA_RUNTIME_HOUR_UNIT}` : null,
    rest ? `${rest}${MEDIA_RUNTIME_MINUTE_UNIT}` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

export function mediaFacts(details: MediaDetails): string {
  const extent =
    details.type === "MOVIE"
      ? runtimeLabel(details.runtimeMinutes)
      : mediaExtent(details);

  return [
    mediaKindLabel(details),
    extent,
    details.year,
    details.genres.join(MEDIA_GENRE_SEPARATOR),
  ]
    .filter(Boolean)
    .join(MEDIA_SEPARATOR);
}

export function episodeCode(season: number, episode: number): string {
  return [
    `${MEDIA_SEASON_CODE}${rankLabel(season)}`,
    `${MEDIA_EPISODE_CODE}${rankLabel(episode)}`,
  ].join(" ");
}

export function starString(rating: number | null): string {
  if (!rating) return "";
  const filled = MEDIA_RATING_GLYPH.repeat(rating);
  return filled + MEDIA_RATING_EMPTY_GLYPH.repeat(MEDIA_RATING_STARS - rating);
}


export function titleKicker(details: MediaDetails): string {
  const tail =
    details.type === "MOVIE"
      ? TITLE_KICKER_MOVIE_EXTENT
      : (details.status ?? "").toLowerCase();

  return [mediaKindLabel(details), tail].filter(Boolean).join(MEDIA_SEPARATOR);
}

export function titleFacts(details: MediaDetails): string[] {
  const head =
    details.type === "MOVIE"
      ? [String(details.year ?? ""), runtimeLabel(details.runtimeMinutes) ?? ""]
      : [
          mediaExtent(details) ?? "",
          String(details.year ?? ""),
        ];

  return [
    ...head,
    details.genres.join(MEDIA_GENRE_SEPARATOR),
    details.certification ?? "",
  ].filter((part) => part.length > 0);
}

export function episodeTotal(details: MediaDetails): number {
  if (details.seasons.length === 0) return details.episodeCount ?? 0;

  return details.seasons.reduce(
    (total, season) => total + season.episodeCount,
    0,
  );
}


export function progressCount(watched: number, total: number): string {
  return TITLE_PROGRESS_COUNT.replace(
    COUNT_TOKEN,
    String(watched),
  ).replace(TOTAL_TOKEN, String(total));
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat(DATE_LOCALE).format(value);
}

export function nextUnwatched(
  details: MediaDetails,
  watched: { seasonNumber: number; episodeNumber: number }[],
): { seasonNumber: number; episodeNumber: number } | null {
  const seen = new Set(
    watched.map((entry) => `${entry.seasonNumber}:${entry.episodeNumber}`),
  );

  for (const season of details.seasons) {
    for (
      let episode = FIRST_SEASON_NUMBER;
      episode <= season.episodeCount;
      episode++
    ) {
      if (!seen.has(`${season.number}:${episode}`)) {
        return { seasonNumber: season.number, episodeNumber: episode };
      }
    }
  }

  return null;
}
