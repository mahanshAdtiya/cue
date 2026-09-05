import { MediaRow } from "@/components/media/media-row";
import {
  EXPLORE_RAIL_SIZE,
  EXPLORE_TOP_COUNTER,
  EXPLORE_TOP_HREF,
  EXPLORE_TOP_NOTE,
  EXPLORE_TOP_TITLE,
} from "@/lib/constants";
import { mediaRating } from "@/lib/media/display";
import type { MediaSummary } from "@/lib/tmdb/media";
import { getTopRated } from "@/lib/tmdb/queries";

function score(item: MediaSummary) {
  const rating = mediaRating(item);
  if (!rating) return null;

  return (
    <span className="text-gold-2 text-mini font-mono tracking-[.1em]">
      {rating}
    </span>
  );
}

export async function TopRatedSection() {
  const items = (await getTopRated()).slice(0, EXPLORE_RAIL_SIZE);

  return (
    <MediaRow
      title={EXPLORE_TOP_TITLE}
      note={EXPLORE_TOP_NOTE}
      seeAllHref={EXPLORE_TOP_HREF}
      items={items}
      limit={EXPLORE_RAIL_SIZE}
      sub={score}
      action={
        <span className="mono">
          {EXPLORE_TOP_COUNTER} {items.length}
        </span>
      }
    />
  );
}
