"use client";

import { SearchHit } from "@/components/search/search-hit";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SEARCH_EMPTY_BODY,
  SEARCH_EMPTY_TITLE,
  SEARCH_ERROR_TITLE,
  SEARCH_IDLE_BODY,
  SEARCH_IDLE_TITLE,
  SEARCH_RESULTS_LABEL,
  SEARCH_SKELETON_ROWS,
  SEARCH_UNAVAILABLE_MESSAGE,
} from "@/lib/constants";
import { mediaKey } from "@/lib/media/display";
import type { TrackedMedia } from "@/lib/media/tracking";
import type { SearchStatus } from "@/lib/search/use-search";

type SearchResultsProps = {
  status: SearchStatus;
  items: TrackedMedia[];
  term: string;
  selected: number;
  onSelect: (index: number) => void;
  onOpen: (item: TrackedMedia) => void;
};

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2.5 px-[18px] py-6">
      <h3 className="text-fg font-serif text-lg">{title}</h3>
      <p className="text-mut-2 max-w-[42ch] text-[13px] leading-[1.6]">
        {body}
      </p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: SEARCH_SKELETON_ROWS }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3.5 border-l-2 border-l-transparent px-[18px] py-2.5"
        >
          <Skeleton r={4} className="aspect-[2/3] w-9" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton h={13} r={4} className="w-2/5" />
            <Skeleton h={10} r={4} className="w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchResults({
  status,
  items,
  term,
  selected,
  onSelect,
  onOpen,
}: SearchResultsProps) {
  if (status === "idle") {
    return <Message title={SEARCH_IDLE_TITLE} body={SEARCH_IDLE_BODY} />;
  }

  if (status === "error") {
    return (
      <Message title={SEARCH_ERROR_TITLE} body={SEARCH_UNAVAILABLE_MESSAGE} />
    );
  }

  if (status === "loading" && !items.length) {
    return <LoadingRows />;
  }

  if (!items.length) {
    return <Message title={SEARCH_EMPTY_TITLE} body={SEARCH_EMPTY_BODY} />;
  }

  return (
    <div
      data-pending={status === "loading" || undefined}
      className="ease-cue flex flex-col transition-opacity duration-[var(--dur)] data-pending:opacity-45"
    >
      <div className="flex items-center gap-4 px-[18px] pb-2.5">
        <span className="text-mut-2 text-mini font-mono tracking-[.2em] uppercase">
          {SEARCH_RESULTS_LABEL}
        </span>
        <span className="bg-w-06 h-px flex-1" />
      </div>

      {items.map((item, index) => (
        <SearchHit
          key={mediaKey(item)}
          item={item}
          term={term}
          selected={index === selected}
          onSelect={() => onSelect(index)}
          onOpen={() => onOpen(item)}
        />
      ))}
    </div>
  );
}
