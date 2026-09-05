import { HOME_FEED_LIMIT, HOME_STUB_MODE } from "../constants";

export type MediaType = "MOVIE" | "TV";
export type EntryStatus = "WANT" | "WATCHING" | "WATCHED";

export type HomeItem = {
  id: string;
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  posterPath: string | null;
  status: EntryStatus;
  episodesDone: number;
  episodeCount: number | null;
  updatedAt: Date;
};

const STUB_ITEMS: HomeItem[] = [
  {
    id: "stub-severance",
    tmdbId: 95396,
    mediaType: "TV",
    name: "Severance",
    posterPath: null,
    status: "WATCHING",
    episodesDone: 6,
    episodeCount: 19,
    updatedAt: new Date("2026-08-30T19:04:00Z"),
  },
  {
    id: "stub-vinland",
    tmdbId: 82684,
    mediaType: "TV",
    name: "Vinland Saga",
    posterPath: null,
    status: "WATCHING",
    episodesDone: 19,
    episodeCount: 48,
    updatedAt: new Date("2026-08-28T21:40:00Z"),
  },
  {
    id: "stub-interstellar",
    tmdbId: 157336,
    mediaType: "MOVIE",
    name: "Interstellar",
    posterPath: null,
    status: "WANT",
    episodesDone: 0,
    episodeCount: null,
    updatedAt: new Date("2026-08-24T11:12:00Z"),
  },
  {
    id: "stub-dark",
    tmdbId: 70523,
    mediaType: "TV",
    name: "Dark",
    posterPath: null,
    status: "WATCHED",
    episodesDone: 26,
    episodeCount: 26,
    updatedAt: new Date("2026-07-02T08:20:00Z"),
  },
];

export async function getHomeItems(userId: string): Promise<HomeItem[]> {
  void userId;

  if (HOME_STUB_MODE === "empty") return [];

  return STUB_ITEMS.slice(0, HOME_FEED_LIMIT);
}
