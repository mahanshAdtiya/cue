"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  EXPLORE_COUNT_LABEL,
  EXPLORE_FILTERS,
  EXPLORE_NOTE,
  MEDIA_KIND_SELECTOR,
  type ExploreFilter,
} from "@/lib/constants";
import {
  countKinds,
  emptyExploreCounts,
  type ExploreCounts,
} from "@/lib/media/explore";

export function ExploreFilters({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<ExploreFilter>("ALL");
  const [counts, setCounts] = useState<ExploreCounts>(emptyExploreCounts);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = body.current;
    if (!el) return;

    const recount = () =>
      setCounts(
        countKinds(
          Array.from(el.querySelectorAll(MEDIA_KIND_SELECTOR), (node) =>
            node.getAttribute("data-media-kind"),
          ),
        ),
      );

    recount();
    const observer = new MutationObserver(recount);
    observer.observe(el, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-explore-filter={filter}
      className="flex flex-col gap-[clamp(26px,3.6vw,40px)]"
    >
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap gap-2">
            {EXPLORE_FILTERS.map((option) => (
              <Button
                key={option.key}
                variant="pill"
                selected={option.key === filter}
                aria-pressed={option.key === filter}
                onClick={() => setFilter(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <span className="mono">
            {counts[filter]} {EXPLORE_COUNT_LABEL}
          </span>
        </div>
        <p className="text-mut-2 max-w-[56ch] text-[13px] leading-[1.6]">
          {EXPLORE_NOTE}
        </p>
      </section>

      <div ref={body} className="flex flex-col gap-[clamp(26px,3.6vw,40px)]">
        {children}
      </div>
    </div>
  );
}
