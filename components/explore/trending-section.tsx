import { MediaRow } from "@/components/media/media-row";
import {
  EXPLORE_RAIL_SIZE,
  EXPLORE_TRENDING_HREF,
  EXPLORE_TRENDING_NOTE,
  EXPLORE_TRENDING_TITLE,
  type ExploreFilter,
} from "@/lib/constants";
import { rankLabel } from "@/lib/media/display";
import { withTracking } from "@/lib/media/tracking";
import { getTrending } from "@/lib/tmdb/queries";

export async function TrendingSection({ filter }: { filter: ExploreFilter }) {
  const items = await withTracking(
    (await getTrending(filter)).slice(0, EXPLORE_RAIL_SIZE),
  );

  return (
    <MediaRow
      title={EXPLORE_TRENDING_TITLE}
      note={EXPLORE_TRENDING_NOTE}
      seeAllHref={EXPLORE_TRENDING_HREF}
      items={items}
      limit={EXPLORE_RAIL_SIZE}
      ranked
      action={
        <span className="mono">
          {rankLabel(1)} — {rankLabel(items.length)}
        </span>
      }
    />
  );
}
