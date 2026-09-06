import { SEARCH_RECENTS_KEY, SEARCH_RECENTS_LIMIT } from "@/lib/constants";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaKey } from "@/lib/media/display";

export type RecentSearch = {
  externalId: string;
  type: MediaType;
  title: string;
};

export function readRecents(): RecentSearch[] {
  try {
    const raw = window.localStorage.getItem(SEARCH_RECENTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isRecent).slice(0, SEARCH_RECENTS_LIMIT);
  } catch {
    return [];
  }
}

function isRecent(value: unknown): value is RecentSearch {
  if (typeof value !== "object" || value === null) return false;

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.externalId === "string" &&
    typeof entry.title === "string" &&
    (entry.type === "MOVIE" || entry.type === "TV_SHOW")
  );
}

function write(entries: RecentSearch[]): RecentSearch[] {
  try {
    window.localStorage.setItem(SEARCH_RECENTS_KEY, JSON.stringify(entries));
  } catch {}

  return entries;
}

export function rememberRecent(entry: RecentSearch): RecentSearch[] {
  const key = mediaKey(entry);
  const rest = readRecents().filter((item) => mediaKey(item) !== key);

  return write([entry, ...rest].slice(0, SEARCH_RECENTS_LIMIT));
}

export function forgetRecent(entry: RecentSearch): RecentSearch[] {
  const key = mediaKey(entry);

  return write(readRecents().filter((item) => mediaKey(item) !== key));
}

export function clearRecents(): RecentSearch[] {
  return write([]);
}
