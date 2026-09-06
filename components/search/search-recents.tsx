"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  SEARCH_RECENTS_CLEAR,
  SEARCH_RECENTS_EMPTY,
  SEARCH_RECENTS_LABEL,
  SEARCH_RECENT_REMOVE_LABEL,
  COUNT_TOKEN,
} from "@/lib/constants";
import { mediaHref, mediaKey, mediaKindLabel } from "@/lib/media/display";
import { fill } from "@/lib/text";
import type { RecentSearch } from "@/lib/search/recents";

type SearchRecentsProps = {
  entries: RecentSearch[];
  onOpen: (entry: RecentSearch) => void;
  onForget: (entry: RecentSearch) => void;
  onClear: () => void;
};

export function SearchRecents({
  entries,
  onOpen,
  onForget,
  onClear,
}: SearchRecentsProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 px-[18px] pb-2.5">
        <span className="text-mut-2 text-mini font-mono tracking-[.2em] uppercase">
          {SEARCH_RECENTS_LABEL}
        </span>
        <span className="bg-w-06 h-px flex-1" />
        {entries.length ? (
          <button
            type="button"
            onClick={onClear}
            className="text-mut-2 hover:text-fg text-mini ease-cue font-mono tracking-[.2em] uppercase transition-colors duration-[var(--dur)]"
          >
            {SEARCH_RECENTS_CLEAR}
          </button>
        ) : null}
      </div>

      {entries.length ? (
        entries.map((entry) => (
          <div
            key={mediaKey(entry)}
            className="hover:bg-w-02 ease-cue group flex items-center border-l-2 border-l-transparent transition-colors duration-[var(--dur)]"
          >
            <Link
              href={mediaHref(entry)}
              onClick={() => onOpen(entry)}
              className="flex min-w-0 flex-1 items-center gap-3.5 px-[18px] py-2.5"
            >
              <Icon name="replay" size={16} className="text-mut-2" />
              <span className="text-fg min-w-0 flex-1 truncate text-sm font-medium">
                {entry.title}
              </span>
              <Badge>{mediaKindLabel(entry)}</Badge>
            </Link>

            <button
              type="button"
              aria-label={fill(SEARCH_RECENT_REMOVE_LABEL, {
                [COUNT_TOKEN]: entry.title,
              })}
              onClick={() => onForget(entry)}
              className="text-mut-2 hover:text-fg ease-cue shrink-0 px-[18px] py-3 opacity-0 transition duration-[var(--dur)] group-hover:opacity-100"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))
      ) : (
        <p className="text-mut-2 px-[18px] py-4 text-[13px] leading-[1.6]">
          {SEARCH_RECENTS_EMPTY}
        </p>
      )}
    </div>
  );
}
