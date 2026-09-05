"use client";

import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { IconButton, iconButtonClass } from "@/components/ui/icon-button";
import {
  HOVER_CARD_OPEN_LABEL,
  MEDIA_ACTIONS,
  MEDIA_ACTION_PENDING,
} from "@/lib/constants";
import { toast } from "@/lib/toast/store";

type MediaActionsProps = {
  href: string;
};

export function MediaActions({ href }: MediaActionsProps) {
  return (
    <div className="flex items-center gap-2.5">
      {MEDIA_ACTIONS.map((action) => (
        <IconButton
          key={action.key}
          shape="round"
          aria-label={action.label}
          onClick={() => toast.show(MEDIA_ACTION_PENDING)}
        >
          <Icon name={action.icon} />
        </IconButton>
      ))}
      <Link
        href={href}
        aria-label={HOVER_CARD_OPEN_LABEL}
        className={`${iconButtonClass("round")} ml-auto`}
      >
        <Icon name="arrow-right" size={16} />
      </Link>
    </div>
  );
}
