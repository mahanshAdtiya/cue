import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { StatusButton } from "@/components/media/status-button";
import { buttonClass } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import {
  HOME_HERO_KICKER,
  HOME_HERO_OPEN,
  HOME_HERO_SIZES,
  MEDIA_SEPARATOR,
} from "@/lib/constants";
import {
  episodeCode,
  hueOf,
  mediaHref,
  mediaKey,
  mediaKindLabel,
} from "@/lib/media/display";
import type { LibraryMedia } from "@/lib/media/library";

function progressLine(item: LibraryMedia): string {
  const parts = [mediaKindLabel(item)];

  if (item.currentSeason && item.currentEpisode) {
    parts.push(episodeCode(item.currentSeason, item.currentEpisode));
  }

  return parts.join(MEDIA_SEPARATOR);
}

export function Billboard({ item }: { item: LibraryMedia }) {
  const href = mediaHref(item);

  return (
    <section
      style={{ "--h": hueOf(item.externalId) } as CSSProperties}
      className="border-line relative flex min-h-[clamp(380px,58vh,620px)] items-end overflow-hidden border-b bg-[repeating-linear-gradient(115deg,hsl(var(--h)_20%_15%)_0_14px,hsl(var(--h)_20%_20%)_14px_28px)]"
    >
      {item.backdropUrl ? (
        <Image
          src={item.backdropUrl}
          alt=""
          fill
          unoptimized
          priority
          sizes={HOME_HERO_SIZES}
          className="animate-fade object-cover object-[center_22%]"
        />
      ) : null}

      <span className="billboard-wash pointer-events-none absolute inset-0" />

      <div className="px-pad relative z-[2] mx-auto flex w-full max-w-[1440px] flex-col gap-3.5 py-[clamp(24px,4vw,44px)]">
        <Kicker className="animate-rise">{HOME_HERO_KICKER}</Kicker>

        <h1 className="animate-rise max-w-[700px] text-[clamp(38px,7vw,76px)] [animation-delay:60ms]">
          <Link href={href} className="text-fg hover:text-gold-2">
            {item.title}
          </Link>
        </h1>

        <span className="animate-rise text-fg-3 font-mono text-[13px] [animation-delay:100ms]">
          {progressLine(item)}
        </span>

        <div className="animate-rise mt-1 flex flex-wrap gap-2.5 [animation-delay:140ms]">
          <StatusButton
            mediaKey={mediaKey(item)}
            status={item.status}
            isFavorite={item.isFavorite}
          />
          <Link href={href} className={buttonClass("secondary")}>
            {HOME_HERO_OPEN}
          </Link>
        </div>
      </div>
    </section>
  );
}
