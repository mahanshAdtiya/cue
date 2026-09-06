import type { LibraryRow } from "@/lib/db/user-media";
import type { TrackedMedia } from "@/lib/media/tracking";
import {
  backdropCardUrl,
  backdropUrl,
  posterUrl,
  yearOf,
} from "@/lib/tmdb/media";

export type LibraryMedia = TrackedMedia & {
  currentSeason: number | null;
  currentEpisode: number | null;
  rating: number | null;
};

export function toLibraryMedia(row: LibraryRow): LibraryMedia {
  return {
    externalId: row.externalId,
    type: row.type,
    title: row.title,
    originalTitle: null,
    description: row.description,
    releaseDate: row.releaseDate,
    year: yearOf(row.releaseDate),
    posterPath: row.posterPath,
    posterUrl: posterUrl(row.posterPath),
    backdropPath: row.backdropPath,
    backdropUrl: backdropUrl(row.backdropPath),
    backdropCardUrl: backdropCardUrl(row.backdropPath),
    isAnime: false,
    voteAverage: row.voteAverage,
    popularity: null,
    status: row.status,
    isFavorite: row.isFavorite,
    currentSeason: row.currentSeason,
    currentEpisode: row.currentEpisode,
    rating: row.rating,
  };
}
