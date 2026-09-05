import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { StepCard } from "@/components/ui/step-card";
import { PRODUCT_STEPS } from "@/lib/constants";

export function EmptyHome() {
  return (
    <main className="px-pad mx-auto w-full max-w-[1440px] flex-1 pt-[clamp(20px,3vw,32px)] pb-16">
      <section className="flex max-w-[660px] flex-col gap-4 pt-[clamp(12px,4vh,48px)]">
        <Kicker className="animate-rise">Your library is empty</Kicker>
        <h1 className="animate-rise [animation-delay:60ms]">
          Start with one title
        </h1>
        <p className="animate-rise text-fg-2 max-w-[62ch] text-[15px] leading-[1.65] [animation-delay:100ms]">
          Add the thing you watched last night. Cue fills in from there — no
          setup, no import, nothing to configure.
        </p>
        <div className="animate-rise mt-1 flex flex-wrap gap-2.5 [animation-delay:140ms]">
          <Link href="/library" className={buttonClass()}>
            Search titles
          </Link>
        </div>
      </section>

      <div className="animate-rise mobile:grid-cols-2 tablet:grid-cols-3 mt-3.5 grid grid-cols-1 gap-[clamp(14px,2vw,20px)] [animation-delay:180ms]">
        {PRODUCT_STEPS.map((step) => (
          <StepCard key={step.num} {...step} />
        ))}
      </div>
    </main>
  );
}
