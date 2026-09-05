"use client";

import { useLinkStatus } from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  ROUTE_LOAD_DELAY_MS,
  ROUTE_LOAD_EXIT_MS,
  ROUTE_LOAD_MINIMUM_MS,
} from "@/lib/constants";

/* The hairline + destination chip, ported from route-loader.js. It renders inside a
   <Link> because that is the only place useLinkStatus() reports from, but it portals
   its output to <body>: the top bar has backdrop-blur, which makes it a containing
   block for `fixed` descendants, so a bar left in place would pin to the header
   instead of the viewport. Next shows the pending state of the last-clicked link
   only, so at most one of these is ever live. */
export function RouteLoad({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const fill = useRef<HTMLSpanElement>(null);
  const shownAt = useRef(0);

  useEffect(() => {
    if (pending) {
      // Grace period: a navigation that resolves inside 90ms shows nothing at all.
      const show = setTimeout(() => {
        shownAt.current = Date.now();
        setLeaving(false);
        setVisible(true);
      }, ROUTE_LOAD_DELAY_MS);

      return () => clearTimeout(show);
    }

    if (!visible) return;

    // Minimum visible time, so a bar that did appear cannot flash back out.
    const held = Math.max(
      0,
      ROUTE_LOAD_MINIMUM_MS - (Date.now() - shownAt.current),
    );
    const settle = setTimeout(() => {
      if (fill.current) fill.current.style.width = "100%";
      setLeaving(true);
    }, held);
    const clear = setTimeout(
      () => setVisible(false),
      held + ROUTE_LOAD_EXIT_MS,
    );

    return () => {
      clearTimeout(settle);
      clearTimeout(clear);
    };
  }, [pending, visible]);

  useEffect(() => {
    if (!visible || leaving) return;

    // Creep asymptotically toward 0.9 and stop. The bar must never claim a
    // completion it has no way to know about. Written straight to the DOM node:
    // a setState per frame would re-render the portal 60 times a second.
    let progress = 0.08;
    let frame = requestAnimationFrame(function tick() {
      progress += (0.9 - progress) * 0.035;
      if (fill.current) fill.current.style.width = `${(progress * 100).toFixed(1)}%`;
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [visible, leaving]);

  if (!visible) return null;

  return createPortal(
    <>
      <div
        role="progressbar"
        aria-label={`Loading ${label}`}
        className="bg-line pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5"
      >
        <span
          ref={fill}
          className="from-gold to-gold-2 ease-cue block h-full w-0 bg-linear-to-r shadow-[0_0_12px_var(--color-gold-55)] transition-[width] duration-[240ms]"
        />
      </div>

      <div
        className={`border-line-2 bg-bg-3 text-fg-2 rounded-pill max-mobile:top-2.5 max-mobile:px-3 pointer-events-none fixed top-3.5 left-1/2 z-[201] flex -translate-x-1/2 items-center gap-[9px] px-3.5 py-2 font-mono text-mini tracking-[.16em] uppercase shadow-[0_16px_40px_rgba(0,0,0,.5)] ${leaving ? "animate-chip-out" : "animate-chip-in"}`}
      >
        <span
          aria-hidden
          className="bg-gold animate-dot size-[7px] shrink-0 rounded-full"
        />
        {label}
      </div>
    </>,
    document.body,
  );
}
