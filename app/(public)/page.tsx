import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { StepCard } from "@/components/ui/step-card";
import { PRODUCT_STEPS } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-[clamp(26px,3.5vw,38px)] pb-16">
      <section className="border-line border-b">
        <div className="px-pad flex w-full max-w-[700px] flex-col gap-3.5 py-[clamp(56px,10vh,110px)]">
          <Kicker className="animate-rise">Cue is not where you watch</Kicker>
          <h1 className="animate-rise text-[clamp(38px,7vw,76px)] [animation-delay:60ms]">
            Keep track of everything you watch
          </h1>
          <p className="animate-rise text-fg-2 max-w-[62ch] text-[15px] leading-[1.65] [animation-delay:100ms]">
            One place for what you want to watch, what you are in the middle of,
            and what you finished — across every service, with the people you
            watch with.
          </p>
          <div className="animate-rise mt-1 flex flex-wrap gap-2.5 [animation-delay:140ms]">
            <Link href="/signup" className={buttonClass()}>
              Create an account
            </Link>
            <Link href="/signin" className={buttonClass("secondary")}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="px-pad grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[clamp(14px,2vw,20px)]">
        {PRODUCT_STEPS.map((step) => (
          <StepCard key={step.num} {...step} />
        ))}
      </section>

      <section className="px-pad">
        <div className="border-line bg-bg-2 flex flex-wrap items-center justify-between gap-5 rounded-xl border p-[clamp(24px,4vw,40px)]">
          <h2 className="max-w-[26ch]">
            Find it → Track it → Watch it → Remember it
          </h2>
          <Link href="/signup" className={buttonClass()}>
            Start tracking
          </Link>
        </div>
      </section>
    </main>
  );
}
