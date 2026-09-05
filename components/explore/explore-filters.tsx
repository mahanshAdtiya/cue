import Link from "next/link";
import type { ReactNode } from "react";

import { ExploreCount } from "@/components/explore/explore-count";
import { buttonClass } from "@/components/ui/button";
import {
  EXPLORE_FILTERS,
  EXPLORE_FILTER_DEFAULT,
  EXPLORE_FILTER_PARAM,
  EXPLORE_NOTE,
  type ExploreFilter,
} from "@/lib/constants";

type ExploreFiltersProps = {
  filter: ExploreFilter;
  children: ReactNode;
};

function filterHref(key: ExploreFilter): string {
  return key === EXPLORE_FILTER_DEFAULT
    ? "/explore"
    : `/explore?${EXPLORE_FILTER_PARAM}=${key}`;
}

export function ExploreFilters({ filter, children }: ExploreFiltersProps) {
  return (
    <div
      data-explore-scope
      className="flex flex-col gap-[clamp(26px,3.6vw,40px)]"
    >
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap gap-2">
            {EXPLORE_FILTERS.map((option) => (
              <Link
                key={option.key}
                href={filterHref(option.key)}
                scroll={false}
                aria-current={option.key === filter ? "true" : undefined}
                data-selected={option.key === filter || undefined}
                className={buttonClass("pill")}
              >
                {option.label}
              </Link>
            ))}
          </div>
          <ExploreCount />
        </div>
        <p className="text-mut-2 max-w-[56ch] text-[13px] leading-[1.6]">
          {EXPLORE_NOTE}
        </p>
      </section>

      {children}
    </div>
  );
}
