"use client";

import { useEffect, useRef, useState } from "react";

import {
  EXPLORE_COUNT_LABEL,
  EXPLORE_SCOPE_SELECTOR,
} from "@/lib/constants";
import { MEDIA_TARGET_SELECTOR } from "@/lib/media/hover";

export function ExploreCount() {
  const anchor = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = anchor.current?.closest(EXPLORE_SCOPE_SELECTOR);
    if (!root) return;

    const recount = () =>
      setCount(root.querySelectorAll(MEDIA_TARGET_SELECTOR).length);

    recount();
    const observer = new MutationObserver(recount);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <span ref={anchor} className="mono">
      {count} {EXPLORE_COUNT_LABEL}
    </span>
  );
}
