"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Poster } from "@/components/media/poster";
import { Badge } from "@/components/ui/badge";
import { SEARCH_HIT_SIZES, STATUS_BADGE_LABELS } from "@/lib/constants";
import { hueOf, mediaHref, mediaSub } from "@/lib/media/display";
import type { TrackedMedia } from "@/lib/media/tracking";

type SearchHitProps = {
  item: TrackedMedia;
  term: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

function highlight(title: string, term: string): ReactNode {
  const start = title.toLowerCase().indexOf(term.toLowerCase());

  if (!term || start < 0) return title;

  const end = start + term.length;

  return (
    <>
      {title.slice(0, start)}
      <em className="text-gold-2 not-italic">{title.slice(start, end)}</em>
      {title.slice(end)}
    </>
  );
}

export function SearchHit({
  item,
  term,
  selected,
  onSelect,
  onOpen,
}: SearchHitProps) {
  return (
    <Link
      href={mediaHref(item)}
      data-selected={selected || undefined}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onOpen}
      className="ease-cue hover:bg-w-02 data-selected:border-l-gold data-selected:bg-w-04 flex items-center gap-3.5 border-l-2 border-l-transparent px-[18px] py-2.5 transition-colors duration-[var(--dur)]"
    >
      <span className="w-9 shrink-0">
        <Poster
          src={item.posterUrl}
          title={item.title}
          hue={hueOf(item.externalId)}
          sizes={SEARCH_HIT_SIZES}
          caption={false}
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-fg truncate text-sm font-medium">
          {highlight(item.title, term)}
        </span>
        <span className="text-(color:--color-cap) text-label font-mono tracking-[.08em] uppercase">
          {mediaSub(item)}
        </span>
      </span>

      {item.status ? (
        <Badge tone={item.status === "CURRENTLY_WATCHING" ? "gold" : "mut"}>
          {STATUS_BADGE_LABELS[item.status]}
        </Badge>
      ) : null}
    </Link>
  );
}
