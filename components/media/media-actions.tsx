"use client";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
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
    <div className="relative z-20 flex w-fit items-center gap-2.5">
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
    </div>
  );
}
