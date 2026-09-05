import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { NOT_FOUND_STRIP } from "@/lib/constants";

export default function NotFound() {
  const { slots, missingIndex, riseDelayMs, riseStepMs } = NOT_FOUND_STRIP;

  return (
    <main className="px-pad flex w-full max-w-[1120px] flex-1 flex-col justify-center gap-[clamp(26px,4vw,42px)] py-[clamp(40px,8vh,96px)]">
      <span className="animate-rise text-gold text-mini flex items-center gap-3 font-mono tracking-[.18em] uppercase">
        <span className="bg-gold block h-px w-11 opacity-60" />
        Error 404 — page not found
      </span>

      <h1 className="animate-rise max-w-[20ch] text-[clamp(44px,8vw,92px)] tracking-[-.02em] [animation-delay:60ms]">
        This one isn&rsquo;t in <i className="text-gold-2">your catalogue</i>.
      </h1>

      <p className="animate-rise text-mut max-w-[52ch] [animation-delay:120ms]">
        The page you asked for doesn&rsquo;t exist, or it moved. Your library,
        ratings and lists are untouched — pick up where you left off below.
      </p>

      <div className="animate-rise flex flex-wrap gap-3 [animation-delay:180ms]">
        <Link href="/" className={`${buttonClass()} max-mobile:w-full`}>
          Back to Home
        </Link>
        <Link
          href="/library"
          className={`${buttonClass("secondary")} max-mobile:w-full`}
        >
          My Library
        </Link>
      </div>

      <div className="animate-rise flex flex-col gap-3 [animation-delay:240ms]">
        <div className="flex items-center gap-3.5">
          <span className="mono">Missing entry</span>
          <span className="mono">—</span>
          <span className="mono">{String(slots).padStart(2, "0")} slots</span>
        </div>
        <div
          aria-hidden="true"
          className="grid grid-cols-[repeat(auto-fill,minmax(clamp(96px,11vw,150px),1fr))] gap-[clamp(10px,1.4vw,16px)]"
        >
          {Array.from({ length: slots }, (_, i) => (
            <span
              key={i}
              style={{ animationDelay: `${riseDelayMs + i * riseStepMs}ms` }}
              className={`animate-rise ease-cue aspect-[2/3] rounded-md transition duration-[var(--dur)] ${
                i === missingIndex
                  ? "border-gold-55 bg-gold-05 text-gold grid place-items-center border border-dashed font-mono text-[22px]"
                  : "border-line bg-bg-2 hover:border-gold-55 border hover:-translate-y-[5px]"
              }`}
            >
              {i === missingIndex ? "?" : null}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
