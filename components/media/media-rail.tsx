"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import {
  RAIL_EDGE_EPSILON,
  RAIL_NEXT_LABEL,
  RAIL_PAGE_RATIO,
  RAIL_PREV_LABEL,
} from "@/lib/constants";
import type { IconName } from "@/lib/icons";

const ARROW =
  "text-fg-2 hover:text-gold-2 bg-veil-4 ease-cue absolute top-0 bottom-[var(--rail-caption)] z-10 grid w-11 place-items-center opacity-0 backdrop-blur-[2px] transition-opacity duration-[var(--dur)] group-hover/rail:opacity-100";

export function MediaRail({ children }: { children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= RAIL_EDGE_EPSILON);
    setAtEnd(el.scrollLeft >= max - RAIL_EDGE_EPSILON);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);

    return () => observer.disconnect();
  }, [sync]);

  const page = (direction: number) => {
    const el = scroller.current;
    if (!el) return;

    el.scrollBy({
      left: direction * el.clientWidth * RAIL_PAGE_RATIO,
      behavior: "smooth",
    });
  };

  const arrow = (
    side: "left" | "right",
    hidden: boolean,
    label: string,
    icon: IconName,
    direction: number,
  ) =>
    hidden ? null : (
      <button
        type="button"
        aria-label={label}
        tabIndex={-1}
        onClick={() => page(direction)}
        className={`${ARROW} ${side === "left" ? "left-0 rounded-r-md" : "right-0 rounded-l-md"}`}
      >
        <Icon name={icon} size={30} />
      </button>
    );

  return (
    <div className="group/rail relative">
      <div
        ref={scroller}
        onScroll={sync}
        data-at-start={atStart || undefined}
        data-at-end={atEnd || undefined}
        className="rail-fade no-scrollbar flex gap-3.5 overflow-x-auto overscroll-x-contain pb-1 [&>*]:w-[clamp(112px,15vw,150px)] [&>*]:shrink-0"
      >
        {children}
      </div>

      {arrow("left", atStart, RAIL_PREV_LABEL, "chevron-left", -1)}
      {arrow("right", atEnd, RAIL_NEXT_LABEL, "chevron-right", 1)}
    </div>
  );
}
