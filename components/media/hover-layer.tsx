"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HoverCard } from "@/components/media/hover-card";
import {
  HOVER_CLOSE_DELAY_MS,
  HOVER_OPEN_DELAY_MS,
  HOVER_POINTER_QUERY,
  HOVER_TRANSITION_MS,
} from "@/lib/constants";
import {
  HOVER_CARD_SELECTOR,
  MEDIA_ART_SELECTOR,
  MEDIA_HOVERED_ATTR,
  MEDIA_TARGET_SELECTOR,
  hoverGeometry,
  readHoverMedia,
  type HoverGeometry,
  type HoverMedia,
} from "@/lib/media/hover";

type Active = {
  media: HoverMedia;
  geometry: HoverGeometry;
};

type Phase = "enter" | "open" | "exit";

export function HoverLayer() {
  const [active, setActive] = useState<Active | null>(null);
  const [phase, setPhase] = useState<Phase>("enter");

  const tile = useRef<HTMLElement | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const pathname = usePathname();

  const cancelOpen = useCallback(() => {
    if (openTimer.current === null) return;
    window.clearTimeout(openTimer.current);
    openTimer.current = null;
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current === null) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const markTile = useCallback((next: HTMLElement | null) => {
    tile.current?.removeAttribute(MEDIA_HOVERED_ATTR);
    tile.current = next;
    next?.setAttribute(MEDIA_HOVERED_ATTR, "");
  }, []);

  const dismiss = useCallback(() => {
    cancelOpen();
    cancelClose();
    markTile(null);
    setActive(null);
    setPhase("enter");
  }, [cancelOpen, cancelClose, markTile]);

  const scheduleOpen = useCallback(
    (target: HTMLElement) => {
      cancelOpen();
      cancelClose();
      if (tile.current && tile.current !== target) dismiss();

      openTimer.current = window.setTimeout(() => {
        openTimer.current = null;

        const media = readHoverMedia(target);
        const art = target.querySelector(MEDIA_ART_SELECTOR);
        if (!media || !(art instanceof HTMLElement)) return;

        markTile(target);
        setActive({
          media,
          geometry: hoverGeometry(
            art.getBoundingClientRect(),
            window.innerWidth,
            window.innerHeight,
          ),
        });
        setPhase("enter");
      }, HOVER_OPEN_DELAY_MS);
    },
    [cancelOpen, cancelClose, dismiss, markTile],
  );

  const scheduleClose = useCallback(() => {
    cancelOpen();
    if (!tile.current || closeTimer.current !== null) return;

    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setPhase("exit");
    }, HOVER_CLOSE_DELAY_MS);
  }, [cancelOpen]);

  useEffect(() => {
    if (!active || phase !== "enter") return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPhase("open"));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [active, phase]);

  useEffect(() => {
    if (phase !== "exit") return;

    const timer = window.setTimeout(() => {
      markTile(null);
      setActive(null);
      setPhase("enter");
    }, HOVER_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [phase, markTile]);

  useEffect(() => {
    const pointer = window.matchMedia(HOVER_POINTER_QUERY);

    const onPointerOver = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType !== "mouse") return;
      if (!(event.target instanceof Element)) return;

      if (event.target.closest(HOVER_CARD_SELECTOR)) {
        cancelClose();
        return;
      }

      const target = event.target.closest(MEDIA_TARGET_SELECTOR);
      if (!(target instanceof HTMLElement)) {
        scheduleClose();
        return;
      }

      if (target === tile.current) {
        cancelClose();
        return;
      }

      scheduleOpen(target);
    };

    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("mouseleave", scheduleClose);
    window.addEventListener("blur", dismiss);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);

    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("mouseleave", scheduleClose);
      window.removeEventListener("blur", dismiss);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [cancelClose, scheduleClose, scheduleOpen, dismiss]);

  useEffect(() => dismiss, [pathname, dismiss]);

  if (!active) return null;

  return createPortal(
    <HoverCard
      media={active.media}
      geometry={active.geometry}
      open={phase === "open"}
    />,
    document.body,
  );
}
