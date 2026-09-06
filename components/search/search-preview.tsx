"use client";

import { Poster } from "@/components/media/poster";
import { Badge } from "@/components/ui/badge";
import { Kicker } from "@/components/ui/kicker";
import {
  SEARCH_PREVIEW_EMPTY,
  SEARCH_PREVIEW_SIZES,
  STATUS_BADGE_LABELS,
} from "@/lib/constants";
import { hueOf, mediaKindLabel, mediaRating } from "@/lib/media/display";
import type { TrackedMedia } from "@/lib/media/tracking";

export function SearchPreview({ item }: { item: TrackedMedia | null }) {
  if (!item) {
    return (
      <p className="text-mut-2 text-[13px] leading-[1.6]">
        {SEARCH_PREVIEW_EMPTY}
      </p>
    );
  }

  const rating = mediaRating(item);

  return (
    <div className="flex flex-col gap-4">
      <Poster
        src={item.posterUrl}
        title={item.title}
        hue={hueOf(item.externalId)}
        sizes={SEARCH_PREVIEW_SIZES}
        caption={false}
        className="w-[132px]"
      />

      <div className="flex flex-col gap-2">
        <Kicker>{mediaKindLabel(item)}</Kicker>
        <h3 className="text-fg font-serif text-[22px] leading-[1.2]">
          {item.title}
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {item.year ? <Badge>{item.year}</Badge> : null}
        {rating ? <Badge>{rating}</Badge> : null}
        {item.status ? (
          <Badge tone={item.status === "CURRENTLY_WATCHING" ? "gold" : "mut"}>
            {STATUS_BADGE_LABELS[item.status]}
          </Badge>
        ) : null}
      </div>

      {item.description ? (
        <p className="text-mut-2 line-clamp-5 text-[13px] leading-[1.6]">
          {item.description}
        </p>
      ) : null}
    </div>
  );
}
