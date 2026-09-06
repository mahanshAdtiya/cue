import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import {
  HOME_COUNT_TOKEN,
  HOME_EXPLORE_HREF,
  HOME_IDLE_BODY,
  HOME_IDLE_BROWSE,
  HOME_IDLE_KICKER,
  HOME_IDLE_LIBRARY,
  HOME_IDLE_TITLE,
  HOME_LIBRARY_HREF,
  HOME_TITLE_UNIT,
  HOME_WATCHED_COUNT_TOKEN,
} from "@/lib/constants";
import { counted } from "@/lib/media/display";
import { fill } from "@/lib/text";

type IdleCardProps = {
  wantCount: number;
  watchedCount: number;
};

export function IdleCard({ wantCount, watchedCount }: IdleCardProps) {
  const body = fill(HOME_IDLE_BODY, {
    [HOME_COUNT_TOKEN]: counted(wantCount, HOME_TITLE_UNIT),
    [HOME_WATCHED_COUNT_TOKEN]: counted(watchedCount, HOME_TITLE_UNIT),
  });

  return (
    <section className="border-line bg-bg-2 flex flex-col gap-3 rounded-xl border p-[clamp(20px,3vw,28px)]">
      <Kicker>{HOME_IDLE_KICKER}</Kicker>
      <h2>{HOME_IDLE_TITLE}</h2>
      <p className="text-mut-2 max-w-[52ch] text-[13px]">{body}</p>
      <div className="mt-1 flex flex-wrap gap-2.5">
        <Link href={HOME_EXPLORE_HREF} className={buttonClass()}>
          {HOME_IDLE_BROWSE}
        </Link>
        <Link href={HOME_LIBRARY_HREF} className={buttonClass("secondary")}>
          {HOME_IDLE_LIBRARY}
        </Link>
      </div>
    </section>
  );
}
