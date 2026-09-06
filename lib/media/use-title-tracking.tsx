"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { adjustWatches, setRating } from "@/actions/user-media";
import {
  COUNT_TOKEN,
  RATING_CLEARED_TOAST,
  RATING_SAVED_TOAST,
  WATCH_ADDED_TOAST,
  WATCH_REMOVED_TOAST,
} from "@/lib/constants";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import { useMediaTracking } from "@/lib/media/use-tracking";
import { toast } from "@/lib/toast/store";

type TitleTrackingSeed = {
  mediaKey: string;
  status: UserMediaStatus | null;
  isFavorite: boolean;
  rating: number | null;
  watches: number;
};

function ratingToast(rating: number | null) {
  if (rating === null) return RATING_CLEARED_TOAST;

  return {
    ...RATING_SAVED_TOAST,
    message: RATING_SAVED_TOAST.message.replace(COUNT_TOKEN, String(rating)),
  };
}

export function useTitleTracking(seed: TitleTrackingSeed) {
  const tracking = useMediaTracking(seed);
  const [rating, showRating] = useOptimistic(seed.rating);
  const [watches, showWatches] = useOptimistic(seed.watches);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function rate(value: number) {
    const wanted = value === rating ? null : value;

    startTransition(async () => {
      showRating(wanted);

      const state = await setRating({ mediaKey: seed.mediaKey, rating: wanted });

      if (state.error) {
        toast.err(state.error);
        if (state.redirectTo) router.push(state.redirectTo);
        return;
      }

      toast.show(ratingToast(wanted));
      router.refresh();
    });
  }

  function adjust(delta: 1 | -1) {
    startTransition(async () => {
      showWatches((current) => Math.max(0, current + delta));

      const state = await adjustWatches({ mediaKey: seed.mediaKey, delta });

      if (state.error) {
        toast.err(state.error);
        if (state.redirectTo) router.push(state.redirectTo);
        return;
      }

      toast.show(delta > 0 ? WATCH_ADDED_TOAST : WATCH_REMOVED_TOAST);
      router.refresh();
    });
  }

  return {
    ...tracking,
    rating,
    watches,
    rate,
    adjust,
    busy: tracking.pending || pending,
  };
}
