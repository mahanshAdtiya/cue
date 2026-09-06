"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setFavorite, setStatus } from "@/actions/user-media";
import {
  FAVORITE_ADD_LABEL,
  FAVORITE_ADDED_TOAST,
  FAVORITE_ADDED_WATCHED_TOAST,
  FAVORITE_REMOVED_TOAST,
  FAVORITE_REMOVE_LABEL,
  NEXT_STATUS_ACTIONS,
  REWATCH_TOAST,
  STATUS_TOASTS,
  UNTRACKED_STATUS_ACTION,
} from "@/lib/constants";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import { toast } from "@/lib/toast/store";

type TrackingSeed = {
  mediaKey: string;
  status: UserMediaStatus | null;
  isFavorite: boolean;
};

function favoriteToast(isFavorite: boolean, created?: boolean) {
  if (!isFavorite) return FAVORITE_REMOVED_TOAST;
  return created ? FAVORITE_ADDED_WATCHED_TOAST : FAVORITE_ADDED_TOAST;
}

function statusToast(
  status: UserMediaStatus,
  previousStatus?: UserMediaStatus | null,
) {
  if (status === "CURRENTLY_WATCHING" && previousStatus === "WATCHED") {
    return REWATCH_TOAST;
  }
  return STATUS_TOASTS[status];
}

export function useMediaTracking(seed: TrackingSeed) {
  const [isFavorite, setFavorited] = useState(seed.isFavorite);
  const [status, setTracked] = useState(seed.status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const next = status ? NEXT_STATUS_ACTIONS[status] : UNTRACKED_STATUS_ACTION;
  const favoriteLabel = isFavorite ? FAVORITE_REMOVE_LABEL : FAVORITE_ADD_LABEL;

  function advanceStatus() {
    const previous = status;
    setTracked(next.status);

    startTransition(async () => {
      const state = await setStatus({
        mediaKey: seed.mediaKey,
        status: next.status,
      });

      if (state.error) {
        setTracked(previous);
        toast.err(state.error);
        if (state.redirectTo) router.push(state.redirectTo);
        return;
      }

      toast.show(statusToast(next.status, state.previousStatus));
      router.refresh();
    });
  }

  function toggleFavorite() {
    const wanted = !isFavorite;
    setFavorited(wanted);

    startTransition(async () => {
      const state = await setFavorite({
        mediaKey: seed.mediaKey,
        isFavorite: wanted,
      });

      if (state.error) {
        setFavorited(!wanted);
        toast.err(state.error);
        if (state.redirectTo) router.push(state.redirectTo);
        return;
      }

      setFavorited(state.isFavorite ?? wanted);
      toast.show(favoriteToast(wanted, state.created));
      router.refresh();
    });
  }

  return {
    status,
    isFavorite,
    pending,
    next,
    favoriteLabel,
    advanceStatus,
    toggleFavorite,
  };
}
