import Link from "next/link";

import { MediaCard } from "@/components/media/media-card";
import { MediaRail } from "@/components/media/media-rail";
import { SectionHeader } from "@/components/ui/section-header";
import {
  MEDIA_ROW_EMPTY,
  MEDIA_ROW_PRIORITY_COUNT,
  MEDIA_ROW_SEE_ALL,
} from "@/lib/constants";
import { mediaKey } from "@/lib/media/display";
import type { MediaSummary } from "@/lib/tmdb/media";

type MediaRowProps = {
  title: string;
  items: MediaSummary[];
  as?: "h1" | "h2" | "h3";
  note?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  empty?: string;
  priority?: boolean;
};

export function MediaRow({
  title,
  items,
  as,
  note,
  seeAllHref,
  seeAllLabel = MEDIA_ROW_SEE_ALL,
  empty = MEDIA_ROW_EMPTY,
  priority,
}: MediaRowProps) {
  return (
    <section className="flex flex-col gap-3.5">
      <SectionHeader
        title={title}
        as={as}
        note={note}
        action={
          seeAllHref ? (
            <Link href={seeAllHref} className="mono hover:text-gold-2">
              {seeAllLabel}
            </Link>
          ) : null
        }
      />
      {items.length ? (
        <MediaRail>
          {items.map((item, index) => (
            <MediaCard
              key={mediaKey(item)}
              item={item}
              priority={priority && index < MEDIA_ROW_PRIORITY_COUNT}
            />
          ))}
        </MediaRail>
      ) : (
        <p className="text-mut-2 text-[13px]">{empty}</p>
      )}
    </section>
  );
}
