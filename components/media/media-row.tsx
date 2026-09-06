import Link from "next/link";
import type { ReactNode } from "react";

import { MediaCard } from "@/components/media/media-card";
import { MediaRail } from "@/components/media/media-rail";
import { SectionHeader } from "@/components/ui/section-header";
import {
  MEDIA_ROW_EMPTY,
  MEDIA_ROW_LIMIT,
  MEDIA_ROW_PRIORITY_COUNT,
  MEDIA_ROW_SEE_ALL,
} from "@/lib/constants";
import { mediaKey } from "@/lib/media/display";
import type { TrackedMedia } from "@/lib/media/tracking";

type MediaRowProps = {
  title: string;
  items: TrackedMedia[];
  seeAllHref: string;
  as?: "h1" | "h2" | "h3";
  note?: string;
  seeAllLabel?: string;
  empty?: string;
  limit?: number;
  priority?: boolean;
  ranked?: boolean;
  sub?: (item: TrackedMedia) => ReactNode;
  action?: ReactNode;
};

export function MediaRow({
  title,
  items,
  as,
  note,
  seeAllHref,
  seeAllLabel = MEDIA_ROW_SEE_ALL,
  empty = MEDIA_ROW_EMPTY,
  limit = MEDIA_ROW_LIMIT,
  priority,
  ranked,
  sub,
  action,
}: MediaRowProps) {
  const shown = items.slice(0, limit);
  return (
    <section className="flex flex-col gap-3.5">
      <SectionHeader
        title={title}
        as={as}
        note={note}
        action={
          <span className="flex items-center gap-3.5">
            {action}
            <Link href={seeAllHref} className="mono hover:text-gold-2">
              {seeAllLabel}
            </Link>
          </span>
        }
      />
      {shown.length ? (
        <MediaRail>
          {shown.map((item, index) => (
            <MediaCard
              key={mediaKey(item)}
              item={item}
              priority={priority && index < MEDIA_ROW_PRIORITY_COUNT}
              rank={ranked ? index + 1 : undefined}
              sub={sub?.(item)}
            />
          ))}
        </MediaRail>
      ) : (
        <p className="text-mut-2 text-[13px]">{empty}</p>
      )}
    </section>
  );
}
