"use client";

import { useEffect, useRef, useState } from "react";

import {
  SPLASH_LIFT_MS,
  SPLASH_MINIMUM_MS,
  SPLASH_SETTLE_MS,
  SPLASH_STEPS,
  SPLASH_TAGLINE,
  SPLASH_WORD,
} from "@/lib/constants";

/* Server-rendered, so it is in the first paint; the client only runs the bar and
   takes it away. Lives in the root layout, which does not remount on navigation —
   so it shows on every document load and never on a route change. */
export function Splash() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [step, setStep] = useState(0);
  const fill = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = (value: number) => {
      const p = Math.max(0, Math.min(1, value));
      if (fill.current) fill.current.style.width = `${(p * 100).toFixed(1)}%`;
      if (pct.current)
        pct.current.textContent = `${String(Math.round(p * 100)).padStart(2, "0")}%`;
    };

    // The curtain runs for a known length of time, so one clock drives both the
    // bar and the labels: they divide the same sweep and land on the last step
    // exactly at 100%. The width is written to the DOM node directly — a
    // setState per frame would re-render the curtain 60 times a second.
    const last = SPLASH_STEPS.length - 1;
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = Math.min(1, (now - started) / SPLASH_MINIMUM_MS);
      paint(elapsed);
      setStep(Math.floor(elapsed * last));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    });

    // requestAnimationFrame stops in a backgrounded tab; land on the end state
    // regardless of whether the sweep got there.
    const settle = setTimeout(() => {
      cancelAnimationFrame(frame);
      setStep(last);
      paint(1);
    }, SPLASH_MINIMUM_MS);

    const lift = setTimeout(
      () => setLeaving(true),
      SPLASH_MINIMUM_MS + SPLASH_SETTLE_MS,
    );

    const remove = setTimeout(
      () => setGone(true),
      SPLASH_MINIMUM_MS + SPLASH_SETTLE_MS + SPLASH_LIFT_MS,
    );

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      clearTimeout(lift);
      clearTimeout(remove);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      data-splash
      role="status"
      aria-live="polite"
      aria-label={`Loading ${SPLASH_WORD}`}
      className={`bg-bg text-fg bg-[image:var(--wash-splash)] fixed inset-0 z-[300] grid grid-rows-[1fr_auto] p-[clamp(20px,4vw,44px)] ${leaving ? "animate-splash-lift" : ""}`}
    >
      <div
        className={`flex flex-col items-center justify-center gap-[clamp(14px,2.4vw,22px)] text-center ${leaving ? "animate-splash-sink" : ""}`}
      >
        <div className="flex gap-[.02em] font-serif text-[clamp(66px,16vw,190px)] leading-[.86] tracking-[-.02em]">
          {[...SPLASH_WORD].map((letter, index) => (
            <span
              key={index}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-splash-rise block"
            >
              {index === 0 ? (
                <i className="text-gold-2 italic">{letter}</i>
              ) : (
                letter
              )}
            </span>
          ))}
        </div>
        <span className="text-mut animate-splash-fade font-mono text-[clamp(9px,1.1vw,11px)] tracking-[.26em] uppercase [animation-delay:340ms]">
          {SPLASH_TAGLINE}
        </span>
      </div>

      <div
        className={`flex flex-col gap-3 ${leaving ? "animate-splash-sink" : "animate-splash-fade [animation-delay:200ms]"}`}
      >
        <div className="text-mut-2 flex items-baseline gap-3.5 font-mono text-mini tracking-[.16em] uppercase">
          <span className="text-fg-2 grid">
            {SPLASH_STEPS.map((label, index) => (
              <span
                key={label}
                aria-hidden={index !== step}
                className={`ease-cue col-start-1 row-start-1 transition-opacity duration-200 ${index === step ? "opacity-100" : "opacity-0"}`}
              >
                {label}
              </span>
            ))}
          </span>
          <span ref={pct} className="text-gold-2 ml-auto tabular-nums">
            00%
          </span>
        </div>
        <div className="bg-line h-0.5 overflow-hidden">
          <span
            ref={fill}
            className="from-gold to-gold-2 block h-full w-0 bg-linear-to-r"
          />
        </div>
      </div>
    </div>
  );
}
