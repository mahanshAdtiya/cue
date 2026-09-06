"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StarRating } from "@/components/ui/star-rating";
import {
  COUNT_TOKEN,
  MEDIA_UNTRACKED_LABEL,
  TITLE_PROGRESS_FINISHED,
  TITLE_PROGRESS_NOT_STARTED,
  TITLE_PROGRESS_UP_NEXT,
  TITLE_SEEN_LABEL,
  TITLE_TRACKING_LABEL,
  TITLE_WATCHED_DONE,
  TITLE_WATCH_ADD_LABEL,
  TITLE_WATCH_REMOVE_LABEL,
} from "@/lib/constants";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import { progressCount } from "@/lib/media/display";
import { useTitleTracking } from "@/lib/media/use-title-tracking";

export type TitleProgress = {
  watched: number;
  total: number;
  position: string | null;
};

type TitleTrackingProps = {
  mediaKey: string;
  status: UserMediaStatus | null;
  isFavorite: boolean;
  rating: number | null;
  watches: number;
  progress: TitleProgress | null;
};

function progressOf(
  progress: TitleProgress,
  status: UserMediaStatus | null,
): { label: string; watched: number } {
  if (status === "WATCHED" || progress.watched >= progress.total) {
    return { label: TITLE_PROGRESS_FINISHED, watched: progress.total };
  }

  if (progress.watched > 0 && progress.position) {
    return {
      label: TITLE_PROGRESS_UP_NEXT.replace(COUNT_TOKEN, progress.position),
      watched: progress.watched,
    };
  }

  if (status) {
    return { label: TITLE_PROGRESS_NOT_STARTED, watched: progress.watched };
  }

  return { label: MEDIA_UNTRACKED_LABEL, watched: progress.watched };
}

export function TitleTracking({
  mediaKey,
  status,
  isFavorite,
  rating,
  watches,
  progress,
}: TitleTrackingProps) {
  const tracking = useTitleTracking({
    mediaKey,
    status,
    isFavorite,
    rating,
    watches,
  });

  const state = progress ? progressOf(progress, tracking.status) : null;
  const percent =
    state && progress && progress.total > 0
      ? Math.round((state.watched / progress.total) * 100)
      : 0;

  return (
    <div className="border-line flex flex-wrap items-center gap-2.5 rounded-[14px] border bg-[rgba(16,16,18,.72)] p-3.5 backdrop-blur-[8px]">
      <span className="text-mut-2 text-micro w-full font-mono tracking-[.2em] uppercase">
        {TITLE_TRACKING_LABEL}
      </span>

      <Button
        disabled={tracking.busy}
        onClick={tracking.advanceStatus}
        className="gap-2 disabled:opacity-60"
      >
        <Icon name={tracking.next.icon} size={16} />
        {tracking.next.label}
      </Button>

      <Button
        variant="secondary"
        disabled={tracking.busy}
        aria-pressed={tracking.isFavorite}
        onClick={tracking.toggleFavorite}
        className={`gap-2 disabled:opacity-60 ${tracking.isFavorite ? "border-gold bg-gold text-gold-ink hover:text-gold-ink" : ""}`}
      >
        <Icon name="star" size={16} filled={tracking.isFavorite} />
        {tracking.favoriteLabel}
      </Button>

      <span className="flex-1" />

      <StarRating
        value={tracking.rating}
        disabled={tracking.busy}
        onRate={tracking.rate}
      />

      {state && progress ? (
        <div className="flex w-full flex-col gap-[7px]">
          <div className="text-mut-2 text-mini flex justify-between font-mono tracking-[.14em] uppercase">
            <span>{state.label}</span>
            <span>{progressCount(state.watched, progress.total)}</span>
          </div>
          <div className="bg-w-08 h-[3px] overflow-hidden rounded-sm">
            <span
              style={{ width: `${percent}%` }}
              className="ease-cue block h-full rounded-sm bg-[linear-gradient(90deg,var(--color-gold),var(--color-gold-2))] transition-[width] duration-500"
            />
          </div>
        </div>
      ) : (
        <div className="text-mut-2 text-mini flex w-full flex-wrap items-center gap-x-4 gap-y-2.5 font-mono tracking-[.14em] uppercase">
          <span className={tracking.status ? "text-gold-2" : ""}>
            {tracking.status === "WATCHED"
              ? TITLE_WATCHED_DONE
              : (tracking.next.label ?? MEDIA_UNTRACKED_LABEL)}
          </span>
          <span className="flex-1" />
          {tracking.watches > 0 ? (
            <span className="inline-flex items-center gap-0.5">
              <button
                type="button"
                disabled={tracking.busy}
                aria-label={TITLE_WATCH_REMOVE_LABEL}
                onClick={() => tracking.adjust(-1)}
                className="border-line-2 text-fg-2 hover:border-gold-55 hover:text-gold-2 ease-cue size-[26px] rounded-[7px] border transition duration-[var(--dur)] disabled:opacity-60"
              >
                –
              </button>
              <span className="text-fg min-w-[52px] text-center">
                {TITLE_SEEN_LABEL.replace(
                  COUNT_TOKEN,
                  String(tracking.watches),
                )}
              </span>
              <button
                type="button"
                disabled={tracking.busy}
                aria-label={TITLE_WATCH_ADD_LABEL}
                onClick={() => tracking.adjust(1)}
                className="border-line-2 text-fg-2 hover:border-gold-55 hover:text-gold-2 ease-cue size-[26px] rounded-[7px] border transition duration-[var(--dur)] disabled:opacity-60"
              >
                +
              </button>
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
