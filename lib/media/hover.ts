import {
  HOVER_CARD_ART_RATIO,
  HOVER_CARD_BODY_H,
  HOVER_CARD_MARGIN,
  HOVER_CARD_MIN_WIDTH,
  HOVER_CARD_SCALE,
  HOVER_TAIL_ELLIPSIS,
  HOVER_TAIL_MAX,
} from "@/lib/constants";
import { hueOf, mediaHref, mediaKey, mediaMeta } from "@/lib/media/display";
import type { MediaSummary } from "@/lib/tmdb/media";

export const MEDIA_TARGET_SELECTOR = "[data-media-id]";
export const MEDIA_ART_SELECTOR = "[data-media-art]";
export const MEDIA_HOVERED_ATTR = "data-hovered";
export const HOVER_CARD_SELECTOR = "[data-hover-card]";

const ATTR = {
  id: "data-media-id",
  href: "data-media-href",
  title: "data-media-title",
  meta: "data-media-meta",
  tail: "data-media-tail",
  poster: "data-media-poster",
  backdrop: "data-media-backdrop",
  hue: "data-media-hue",
} as const;

export type HoverMedia = {
  id: string;
  href: string;
  title: string;
  meta: string;
  tail: string;
  poster: string | null;
  backdrop: string | null;
  hue: number;
};

export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type HoverGeometry = {
  closed: Rect;
  open: Rect;
  closedArtHeight: number;
  openArtHeight: number;
};

function tail(description: string | null): string {
  if (!description) return "";
  if (description.length <= HOVER_TAIL_MAX) return description;
  return description.slice(0, HOVER_TAIL_MAX).trimEnd() + HOVER_TAIL_ELLIPSIS;
}

export function hoverAttrs(item: MediaSummary): Record<string, string> {
  return {
    [ATTR.id]: mediaKey(item),
    [ATTR.href]: mediaHref(item),
    [ATTR.title]: item.title,
    [ATTR.meta]: mediaMeta(item),
    [ATTR.tail]: tail(item.description),
    [ATTR.poster]: item.posterUrl ?? "",
    [ATTR.backdrop]: item.backdropCardUrl ?? "",
    [ATTR.hue]: String(hueOf(item.externalId)),
  };
}

export function readHoverMedia(target: HTMLElement): HoverMedia | null {
  const id = target.getAttribute(ATTR.id);
  if (!id) return null;

  const read = (name: string) => target.getAttribute(name) ?? "";

  return {
    id,
    href: read(ATTR.href),
    title: read(ATTR.title),
    meta: read(ATTR.meta),
    tail: read(ATTR.tail),
    poster: read(ATTR.poster) || null,
    backdrop: read(ATTR.backdrop) || null,
    hue: Number(read(ATTR.hue)),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

export function hoverGeometry(
  art: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
): HoverGeometry {
  const maxWidth = viewportWidth - HOVER_CARD_MARGIN * 2;
  const width = Math.min(
    Math.max(art.width * HOVER_CARD_SCALE, HOVER_CARD_MIN_WIDTH),
    maxWidth,
  );
  const openArtHeight = Math.round(width * HOVER_CARD_ART_RATIO);
  const height = openArtHeight + HOVER_CARD_BODY_H;

  const centerX = art.left + art.width / 2;
  const centerY = art.top + art.height / 2;

  return {
    closed: {
      left: art.left,
      top: art.top,
      width: art.width,
      height: art.height,
    },
    open: {
      left: clamp(
        centerX - width / 2,
        HOVER_CARD_MARGIN,
        viewportWidth - width - HOVER_CARD_MARGIN,
      ),
      top: clamp(
        centerY - height / 2,
        HOVER_CARD_MARGIN,
        viewportHeight - height - HOVER_CARD_MARGIN,
      ),
      width,
      height,
    },
    closedArtHeight: art.height,
    openArtHeight,
  };
}
