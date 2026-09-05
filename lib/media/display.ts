import {
  MEDIA_HUE_SEED,
  MEDIA_HUE_STEPS,
  MEDIA_RATING_DECIMALS,
  MEDIA_RATING_GLYPH,
  MEDIA_SEPARATOR,
  MEDIA_TYPE_LABELS,
} from "@/lib/constants";
import type { MediaSummary } from "@/lib/tmdb/media";

export function hueOf(externalId: string): number {
  let hue = 0;
  for (const char of externalId) {
    hue = (hue * MEDIA_HUE_SEED + char.charCodeAt(0)) % MEDIA_HUE_STEPS;
  }
  return hue;
}

export function mediaKey(item: MediaSummary): string {
  return `${item.type}:${item.externalId}`;
}

export function mediaHref(item: MediaSummary): string {
  return `/title/${item.externalId}`;
}

export function mediaTypeLabel(item: MediaSummary): string {
  return MEDIA_TYPE_LABELS[item.type];
}

export function mediaSub(item: MediaSummary): string {
  return [item.year, mediaTypeLabel(item)].filter(Boolean).join(MEDIA_SEPARATOR);
}

export function mediaRating(item: MediaSummary): string | null {
  if (!item.voteAverage) return null;
  return `${MEDIA_RATING_GLYPH} ${item.voteAverage.toFixed(MEDIA_RATING_DECIMALS)}`;
}

export function mediaMeta(item: MediaSummary): string {
  return [mediaTypeLabel(item), item.year, mediaRating(item)]
    .filter(Boolean)
    .join(MEDIA_SEPARATOR);
}
