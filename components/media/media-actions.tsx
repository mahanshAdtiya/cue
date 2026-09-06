"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setFavorite } from "@/actions/user-media";
import { Icon } from "@/components/ui/icon";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import {
  FAVORITE_ADDED_TOAST,
  FAVORITE_ADDED_WATCHED_TOAST,
  FAVORITE_REMOVED_TOAST,
  FAVORITE_REMOVE_LABEL,
  HOVER_CARD_OPEN_LABEL,
  MEDIA_ACTIONS,
  MEDIA_ACTION_PENDING,
} from "@/lib/constants";
import type { HoverMedia } from "@/lib/media/hover";
import { toast } from "@/lib/toast/store";

type MediaActionsProps = {
  media: HoverMedia;
};

function favoriteToast(isFavorite: boolean, created?: boolean) {
  if (!isFavorite) return FAVORITE_REMOVED_TOAST;
  return created ? FAVORITE_ADDED_WATCHED_TOAST : FAVORITE_ADDED_TOAST;
}

export function MediaActions({ media }: MediaActionsProps) {
  const [isFavorite, setIsFavorite] = useState(media.isFavorite);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);

    startTransition(async () => {
      const state = await setFavorite({
        mediaKey: media.id,
        isFavorite: next,
      });

      if (state.error) {
        setIsFavorite(!next);
        toast.err(state.error);
        if (state.redirectTo) router.push(state.redirectTo);
        return;
      }

      setIsFavorite(state.isFavorite ?? next);
      toast.show(favoriteToast(next, state.created));
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2.5">
      {MEDIA_ACTIONS.map((action) => {
        const favorite = action.key === "favorite";

        return (
          <IconButton
            key={action.key}
            shape="round"
            on={favorite && isFavorite}
            disabled={favorite && pending}
            aria-pressed={favorite ? isFavorite : undefined}
            aria-label={
              favorite && isFavorite ? FAVORITE_REMOVE_LABEL : action.label
            }
            className={favorite ? "disabled:opacity-60" : undefined}
            onClick={
              favorite ? toggleFavorite : () => toast.show(MEDIA_ACTION_PENDING)
            }
          >
            <Icon name={action.icon} />
          </IconButton>
        );
      })}
      <Link
        href={media.href}
        aria-label={HOVER_CARD_OPEN_LABEL}
        className={`${iconButtonClass("round")} ml-auto`}
      >
        <Icon name="arrow-right" size={16} />
      </Link>
    </div>
  );
}
