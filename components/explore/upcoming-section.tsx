import { UpcomingList } from "@/components/explore/upcoming-list";
import type { ExploreFilter } from "@/lib/constants";
import { getUpcomingEpisodes } from "@/lib/tmdb/queries";

export async function UpcomingSection({ filter }: { filter: ExploreFilter }) {
  if (filter === "movies") return null;

  return <UpcomingList episodes={await getUpcomingEpisodes(filter)} />;
}
