"use client";

import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { HOVER_CARD_OPEN_LABEL } from "@/lib/constants";
import type { HoverMedia } from "@/lib/media/hover";
import { useMediaTracking } from "@/lib/media/use-tracking";

type MediaActionsProps = {
  media: HoverMedia;
};

export function MediaActions({ media }: MediaActionsProps) {
  const {
    isFavorite,
    pending,
    next,
    favoriteLabel,
    advanceStatus,
    toggleFavorite,
  } = useMediaTracking({
    mediaKey: media.id,
    status: media.status,
    isFavorite: media.isFavorite,
  });

  return (
    <div className="flex items-center gap-2.5">
      <Tooltip label={next.label} align="start">
        <IconButton
          shape="round"
          disabled={pending}
          aria-label={next.label}
          className="disabled:opacity-60"
          onClick={advanceStatus}
        >
          <Icon name={next.icon} />
        </IconButton>
      </Tooltip>
      <Tooltip label={favoriteLabel}>
        <IconButton
          shape="round"
          on={isFavorite}
          disabled={pending}
          aria-pressed={isFavorite}
          aria-label={favoriteLabel}
          className="disabled:opacity-60"
          onClick={toggleFavorite}
        >
          <Icon name="star" />
        </IconButton>
      </Tooltip>
      <Tooltip label={HOVER_CARD_OPEN_LABEL} align="end" className="ml-auto">
        <Link
          href={media.href}
          aria-label={HOVER_CARD_OPEN_LABEL}
          className={iconButtonClass("round")}
        >
          <Icon name="arrow-right" size={16} />
        </Link>
      </Tooltip>
    </div>
  );
}
