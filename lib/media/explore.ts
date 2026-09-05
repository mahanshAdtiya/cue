import { EXPLORE_FILTERS, type ExploreFilter } from "@/lib/constants";

export type ExploreCounts = Record<ExploreFilter, number>;

export function emptyExploreCounts(): ExploreCounts {
  return Object.fromEntries(
    EXPLORE_FILTERS.map((option) => [option.key, 0]),
  ) as ExploreCounts;
}

export function countKinds(kinds: Iterable<string | null>): ExploreCounts {
  const counts = emptyExploreCounts();

  for (const kind of kinds) {
    if (!kind || !(kind in counts) || kind === "ALL") continue;
    counts[kind as ExploreFilter] += 1;
    counts.ALL += 1;
  }

  return counts;
}
