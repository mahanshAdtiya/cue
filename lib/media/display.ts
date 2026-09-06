import {
  MEDIA_EPISODE_CODE,
  MEDIA_RATING_EMPTY_GLYPH,
  MEDIA_RATING_STARS,
  MEDIA_EPISODE_UNIT,
  MEDIA_EXTENT_FEATURE,
  MEDIA_HUE_SEED,
  MEDIA_HUE_STEPS,
  MEDIA_KEY_SEPARATOR,
  MEDIA_KIND_LABELS,
  MEDIA_RANK_PAD,
  MEDIA_RATING_DECIMALS,
  MEDIA_RATING_GLYPH,
  MEDIA_SEASON_CODE,
  MEDIA_SEASON_UNIT,
  MEDIA_SEPARATOR,
} from "@/lib/constants";
import type { MediaType } from "@/lib/db/schema/media";
import type { MediaDetails, MediaSummary } from "@/lib/tmdb/media";

export type MediaKind = MediaType | "ANIME";

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

export function mediaHref(item: MediaSummary): string {
  return `/title/${item.externalId}`;
}

export function mediaKind(item: MediaSummary): MediaKind {
  return item.isAnime ? "ANIME" : item.type;
}

export function mediaKindLabel(item: MediaSummary): string {
  return MEDIA_KIND_LABELS[mediaKind(item)];
}

export function mediaSub(item: MediaSummary): string {
  return [item.year, mediaKindLabel(item)]
    .filter(Boolean)
    .join(MEDIA_SEPARATOR);
}

export function mediaRating(item: MediaSummary): string | null {
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
