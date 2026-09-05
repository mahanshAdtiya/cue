"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

import { TrackButton } from "@/components/media/track-button";
import { buttonClass } from "@/components/ui/button";
import {
  EXPLORE_MARQUEE_HOLD_MS,
  EXPLORE_MARQUEE_INDEX_HEAD,
  EXPLORE_MARQUEE_OPEN,
  EXPLORE_MARQUEE_SWAP_MS,
  EXPLORE_MARQUEE_TRACK,
} from "@/lib/constants";
import { rankLabel } from "@/lib/media/display";

export type MarqueePick = {
  key: string;
  href: string;
  title: string;
  kindLabel: string;
  meta: string[];
  overview: string | null;
  hue: number;
};

type MarqueeStageProps = {
  eyebrow: string;
  picks: MarqueePick[];
};

export function MarqueeStage({ eyebrow, picks }: MarqueeStageProps) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (index === shown) return;

    const timer = window.setTimeout(
      () => setShown(index),
      EXPLORE_MARQUEE_SWAP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [index, shown]);

  useEffect(() => {
    if (held || picks.length < 2) return;

    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % picks.length),
      EXPLORE_MARQUEE_HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [held, index, picks.length]);

  const active = picks[index];
  const body = picks[shown];

  const fade = `ease-cue transition-[opacity,transform] duration-[var(--mq-swap)] ${
    index === shown ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
  }`;

  const hold = (position: number) => () => {
    setHeld(true);
    setIndex(position);
  };

  return (
    <section
      style={
        {
          "--h": active.hue,
          "--mq-swap": `${EXPLORE_MARQUEE_SWAP_MS}ms`,
          "--mq-hold": `${EXPLORE_MARQUEE_HOLD_MS}ms`,
        } as CSSProperties
      }
      className="border-line -mx-pad -mt-(--page-top) px-pad desktop:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] desktop:min-h-[clamp(520px,76vh,760px)] desktop:gap-[clamp(24px,4vw,56px)] relative grid grid-cols-1 content-center gap-0 overflow-hidden border-b"
    >
      <span className="marquee-wash absolute inset-0 -z-20" />
      <span className="marquee-grain pointer-events-none absolute inset-0 -z-10" />

      <div className="animate-rise desktop:py-[clamp(40px,7vh,84px)] flex min-w-0 flex-col gap-[clamp(14px,2vw,20px)] py-[clamp(36px,6vh,64px)] [animation-delay:40ms]">
        <span className="text-gold text-mini flex items-center gap-3 font-mono tracking-[.16em] uppercase">
          <s className="block h-px w-[38px] bg-current opacity-55" />
          {eyebrow}
        </span>

        <h1
          className={`${fade} max-w-[18ch] font-serif text-[clamp(46px,8.5vw,104px)] leading-[.94] font-normal tracking-[-.02em]`}
        >
          <Link href={body.href} className="text-fg hover:text-gold-2">
            {body.title}
          </Link>
        </h1>

        <div
          className={`${fade} text-fg-3 text-label flex flex-wrap items-center gap-x-3.5 gap-y-2.5 font-mono tracking-[.16em] uppercase`}
        >
          <span className="text-gold-2">{body.kindLabel}</span>
          {body.meta.map((part) => (
            <span key={part}>{part}</span>
          ))}
        </div>

        {body.overview ? (
          <p
            className={`${fade} text-fg-2 max-w-[50ch] text-base leading-[1.6]`}
          >
            {body.overview}
          </p>
        ) : null}

        <div className={`${fade} mt-1 flex flex-wrap gap-2.5`}>
          <TrackButton label={EXPLORE_MARQUEE_TRACK} />
          <Link href={body.href} className={buttonClass("secondary")}>
            {EXPLORE_MARQUEE_OPEN}
          </Link>
        </div>
      </div>

      <div
        onMouseLeave={() => setHeld(false)}
        className="animate-rise desktop:border-line desktop:py-[clamp(28px,5vh,64px)] desktop:pl-[clamp(18px,2.4vw,32px)] flex flex-col justify-center gap-0.5 pb-[clamp(28px,5vh,48px)] desktop:border-l desktop:pb-0 [animation-delay:120ms]"
      >
        <span className="text-mut-2 text-micro mb-3.5 font-mono tracking-[.22em] uppercase">
          {EXPLORE_MARQUEE_INDEX_HEAD}
        </span>

        {picks.map((pick, position) => {
          const on = position === index;
          return (
            <Link
              key={pick.key}
              href={pick.href}
              onMouseEnter={hold(position)}
              onFocus={hold(position)}
              onBlur={() => setHeld(false)}
              className={`ease-cue border-w-06 mobile:grid-cols-[34px_minmax(0,1fr)_auto] mobile:gap-3.5 hover:text-fg relative grid min-h-14 grid-cols-[28px_minmax(0,1fr)] items-center gap-2.5 border-t px-1 py-[15px] transition-[color,padding-left] duration-200 last:border-b hover:pl-2.5 ${
                on ? "text-fg pl-2.5" : "text-mut"
              }`}
            >
              <span
                className={`text-mini font-mono tracking-[.1em] ${on ? "text-gold-2" : "text-mut-2"}`}
              >
                {rankLabel(position + 1)}
              </span>
              <span className="truncate text-[15px] font-medium">
                {pick.title}
              </span>
              <span
                className={`max-mobile:hidden text-mini font-mono tracking-[.12em] uppercase ${on ? "text-gold-2" : "text-mut-2"}`}
              >
                {pick.kindLabel}
              </span>
              {on ? (
                <span
                  key={index}
                  data-held={held || undefined}
                  className="marquee-tick bg-gold absolute inset-x-0 -bottom-px h-px origin-left"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
