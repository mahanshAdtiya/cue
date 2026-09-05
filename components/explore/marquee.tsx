import { MarqueeStage, type MarqueePick } from "@/components/explore/marquee-stage";
import {
  EXPLORE_MARQUEE_EYEBROW,
  EXPLORE_MARQUEE_WEEK,
  MEDIA_SEPARATOR,
} from "@/lib/constants";
import {
  hueOf,
  mediaExtent,
  mediaHref,
  mediaKey,
  mediaKindLabel,
} from "@/lib/media/display";
import type { MediaDetails } from "@/lib/tmdb/media";
import { isoWeek } from "@/lib/time";

function toPick(item: MediaDetails): MarqueePick {
  return {
    key: mediaKey(item),
    href: mediaHref(item),
    title: item.title,
    kindLabel: mediaKindLabel(item),
    meta: [
      item.year ? String(item.year) : null,
      item.genres.length ? item.genres.join(MEDIA_SEPARATOR) : null,
      mediaExtent(item),
    ].filter((part): part is string => part !== null),
    overview: item.description,
    hue: hueOf(item.externalId),
  };
}

export function Marquee({ items }: { items: MediaDetails[] }) {
  if (!items.length) return null;

  const eyebrow = `${EXPLORE_MARQUEE_EYEBROW} — ${EXPLORE_MARQUEE_WEEK} ${isoWeek(new Date())}`;

  return <MarqueeStage eyebrow={eyebrow} picks={items.map(toPick)} />;
}
