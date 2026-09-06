import Link from "next/link";
import type { CSSProperties } from "react";

import { TitleTracking } from "@/components/title/title-tracking";
import { Poster } from "@/components/media/poster";
import {
  TITLE_FACTLINE_SEPARATOR,
  TITLE_POSTER_SIZES,
  TITLE_SYNOPSIS_EMPTY,
} from "@/lib/constants";
import { hueOf } from "@/lib/media/display";
import type { HeroMedia, HeroTracking } from "@/lib/media/hero";

type TitleHeroProps = {
  media: HeroMedia;
  tracking: HeroTracking;
  linked?: boolean;
};

export function TitleHero({ media, tracking, linked }: TitleHeroProps) {
  const hue = hueOf(media.externalId);
  const parts = media.rating ? [...media.facts, media.rating] : media.facts;

  return (
    <section className="mobile:grid-cols-[clamp(150px,34vw,200px)_minmax(0,1fr)] mobile:gap-5 tablet:grid-cols-[clamp(200px,22vw,286px)_minmax(0,1fr)] tablet:gap-[clamp(24px,3.4vw,48px)] grid grid-cols-1 gap-5 pt-[clamp(28px,8vh,92px)] pb-[clamp(26px,3vw,38px)]">
      <div
        style={{ "--h": hue } as CSSProperties}
        className="animate-rise ease-cue mobile:max-w-none w-full max-w-[190px] shadow-[0_30px_80px_rgba(0,0,0,.6)] transition-transform duration-300 hover:-translate-y-[5px]"
      >
        <Poster
          src={media.posterUrl}
          title={media.title}
          hue={hue}
          sizes={TITLE_POSTER_SIZES}
          priority
          className="rounded-xl border-[var(--color-line-2)]"
        />
      </div>

      <div className="animate-rise flex min-w-0 flex-col gap-3.5 self-end [animation-delay:60ms]">
        <span className="text-gold text-mini flex items-center gap-[11px] font-mono tracking-[.2em] uppercase">
          <span className="block h-px w-[30px] bg-current opacity-50" />
          {media.kicker}
        </span>

        <h1 className="text-[clamp(44px,7.4vw,88px)] leading-[.95] tracking-[-.02em]">
          {linked ? (
            <Link href={media.href} className="text-fg hover:text-gold-2">
              {media.title}
            </Link>
          ) : (
            media.title
          )}
        </h1>

        <div className="text-fg-3 text-label flex flex-wrap items-center gap-x-3 gap-y-2 font-mono tracking-[.14em] uppercase">
          {parts.map((part, index) => (
            <span key={part} className="flex items-center gap-x-3">
              {index > 0 ? (
                <span aria-hidden className="opacity-40">
                  {TITLE_FACTLINE_SEPARATOR}
                </span>
              ) : null}
              {part}
            </span>
          ))}
        </div>

        <p className="text-fg-2 max-w-[62ch] text-base leading-[1.65]">
          {media.synopsis ?? TITLE_SYNOPSIS_EMPTY}
        </p>

        <div className="mt-1">
          <TitleTracking {...tracking} />
        </div>
      </div>
    </section>
  );
}
