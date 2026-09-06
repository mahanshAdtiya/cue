"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import { MediaActions } from "@/components/media/media-actions";
import {
  HOVER_CARD_BODY_H,
  HOVER_CARD_SIZES,
  HOVER_FADE_DELAY_MS,
  HOVER_FADE_MS,
  HOVER_STATE_UNTRACKED,
  HOVER_TRANSITION_MS,
} from "@/lib/constants";
import type { HoverGeometry, HoverMedia } from "@/lib/media/hover";

type HoverCardProps = {
  media: HoverMedia;
  geometry: HoverGeometry;
  open: boolean;
};

export function HoverCard({ media, geometry, open }: HoverCardProps) {
  const rect = open ? geometry.open : geometry.closed;
  const artHeight = open ? geometry.openArtHeight : geometry.closedArtHeight;
  const showBackdrop = open && Boolean(media.backdrop);
  const duration = { transitionDuration: `${HOVER_TRANSITION_MS}ms` };
  const fade = {
    transitionDuration: `${HOVER_FADE_MS}ms`,
    transitionDelay: open ? `${HOVER_FADE_DELAY_MS}ms` : "0ms",
  };

  return (
    <div
      data-hover-card
      style={
        {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          "--h": media.hue,
          ...duration,
        } as CSSProperties
      }
      className="border-line-2 bg-overlay ease-cue fixed z-[90] flex flex-col overflow-hidden rounded-xl border shadow-[0_26px_60px_rgba(0,0,0,.62)] transition-[left,top,width,height]"
    >
      <div
        style={{ height: artHeight, ...duration }}
        className="ease-cue relative w-full shrink-0 bg-[repeating-linear-gradient(115deg,hsl(var(--h)_20%_16%)_0_12px,hsl(var(--h)_20%_21%)_12px_24px)] transition-[height]"
      >
        {media.poster ? (
          <Image
            src={media.poster}
            alt=""
            fill
            unoptimized
            sizes={HOVER_CARD_SIZES}
            style={fade}
            className={`ease-cue object-cover transition-opacity ${showBackdrop ? "opacity-0" : "opacity-100"}`}
          />
        ) : null}
        {media.backdrop ? (
          <Image
            src={media.backdrop}
            alt=""
            fill
            unoptimized
            sizes={HOVER_CARD_SIZES}
            style={fade}
            className={`ease-cue object-cover transition-opacity ${showBackdrop ? "opacity-100" : "opacity-0"}`}
          />
        ) : null}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,var(--color-veil-2)_100%)]" />
        <b
          style={fade}
          className={`ease-cue absolute inset-x-4 bottom-3 line-clamp-2 font-serif text-2xl leading-[1.05] font-normal transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        >
          {media.title}
        </b>
      </div>

      <div
        style={{
          width: geometry.open.width,
          height: HOVER_CARD_BODY_H,
          ...fade,
        }}
        className={`ease-cue flex shrink-0 flex-col gap-2.5 px-4 pt-3.5 pb-4 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      >
        <MediaActions media={media} />
        <span className="mono">{media.meta}</span>
        <span className="text-gold-2 text-xs">{HOVER_STATE_UNTRACKED}</span>
        {media.tail ? (
          <span className="text-mut line-clamp-2 text-xs leading-[1.5]">
            {media.tail}
          </span>
        ) : null}
      </div>
    </div>
  );
}
