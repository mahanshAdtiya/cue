import Link from "next/link";
import type { ReactNode } from "react";

import { Poster } from "@/components/media/poster";
import { MEDIA_CARD_SIZES } from "@/lib/constants";
import {
  hueOf,
  mediaHref,
  mediaKind,
  mediaSub,
  rankLabel,
} from "@/lib/media/display";
import { hoverAttrs } from "@/lib/media/hover";
import type { MediaSummary } from "@/lib/tmdb/media";

type MediaCardProps = {
  item: MediaSummary;
  priority?: boolean;
  rank?: number;
  sub?: ReactNode;
};

export function MediaCard({ item, priority, rank, sub }: MediaCardProps) {
  const href = mediaHref(item);

  return (
    <div
      data-media-kind={mediaKind(item)}
      className="group relative flex flex-col gap-2"
      {...hoverAttrs(item)}
    >
      <Link href={href} data-media-art className="block">
        <Poster
          src={item.posterUrl}
          title={item.title}
          hue={hueOf(item.externalId)}
          sizes={MEDIA_CARD_SIZES}
          priority={priority}
        />
      </Link>
      <div className="ease-cue flex flex-col gap-1.5 transition-opacity duration-[var(--dur)] group-data-[hovered]:opacity-0">
        <Link
          href={href}
          className="text-fg hover:text-gold-2 line-clamp-1 text-[13px] leading-[1.3] font-medium"
        >
          {rank ? (
            <span className="text-gold mr-1.5 font-serif text-[15px]">
              {rankLabel(rank)}
            </span>
          ) : null}
          {item.title}
        </Link>
        {sub ?? (
          <span className="text-(color:--color-label) text-mini font-mono tracking-[.08em] uppercase">
            {mediaSub(item)}
          </span>
        )}
      </div>
    </div>
  );
}
