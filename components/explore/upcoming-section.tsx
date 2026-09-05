import { UpcomingList } from "@/components/explore/upcoming-list";
import { getUpcomingEpisodes } from "@/lib/tmdb/queries";

export async function UpcomingSection() {
  return <UpcomingList episodes={await getUpcomingEpisodes()} />;
}
