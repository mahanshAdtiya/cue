"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setFavorite, setStatus } from "@/actions/user-media";
import { Icon } from "@/components/ui/icon";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  FAVORITE_ADD_LABEL,
  FAVORITE_ADDED_TOAST,
  FAVORITE_ADDED_WATCHED_TOAST,
  FAVORITE_REMOVED_TOAST,
  FAVORITE_REMOVE_LABEL,
  HOVER_CARD_OPEN_LABEL,
  NEXT_STATUS_ACTIONS,
  REWATCH_TOAST,
  STATUS_TOASTS,
  UNTRACKED_STATUS_ACTION,
} from "@/lib/constants";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import type { HoverMedia } from "@/lib/media/hover";
import { toast } from "@/lib/toast/store";

type MediaActionsProps = {
  media: HoverMedia;
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

export function MediaActions({ media }: MediaActionsProps) {
  const [isFavorite, setFavorited] = useState(media.isFavorite);
  const [status, setTracked] = useState(media.status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const next = status ? NEXT_STATUS_ACTIONS[status] : UNTRACKED_STATUS_ACTION;
  const favoriteLabel = isFavorite ? FAVORITE_REMOVE_LABEL : FAVORITE_ADD_LABEL;

  function advanceStatus() {
    const previous = status;
    setTracked(next.status);

    startTransition(async () => {
      const state = await setStatus({
        mediaKey: media.id,
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
        mediaKey: media.id,
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
