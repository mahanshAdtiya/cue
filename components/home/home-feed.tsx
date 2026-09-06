import { HomeHero } from "@/components/home/home-hero";
import { IdleCard } from "@/components/home/idle-card";
import { RecentlyWatched } from "@/components/home/recently-watched";
import { MediaRow } from "@/components/media/media-row";
import {
  COUNT_TOKEN,
  HOME_LIBRARY_HREF,
  HOME_RAIL_SIZE,
  HOME_TITLE_UNIT,
  HOME_WANT_EMPTY,
  HOME_WANT_NOTE,
  HOME_WANT_TITLE,
  HOME_WATCHING_EMPTY,
  HOME_WATCHING_NOTE,
  HOME_WATCHING_TITLE,
} from "@/lib/constants";
import { counted } from "@/lib/media/display";
import type { LibraryMedia } from "@/lib/media/library";
import type { UserMediaCounts } from "@/lib/db/user-media";
import { fill } from "@/lib/text";

type HomeFeedProps = {
  counts: UserMediaCounts;
  watching: LibraryMedia[];
  want: LibraryMedia[];
  recent: LibraryMedia[];
  heroEpisodes: number;
};

export function HomeFeed({
  counts,
  watching,
  want,
  recent,
  heroEpisodes,
}: HomeFeedProps) {
  const [hero] = watching;

  const watchingNote = fill(HOME_WATCHING_NOTE, {
    [COUNT_TOKEN]: String(counts.CURRENTLY_WATCHING),
  });
  const wantNote = fill(HOME_WANT_NOTE, {
    [COUNT_TOKEN]: counted(counts.WANT_TO_WATCH, HOME_TITLE_UNIT),
  });

  return (
    <main className="flex w-full flex-1 flex-col gap-[clamp(26px,3.5vw,38px)] pb-16">
      {hero ? <HomeHero item={hero} watchedEpisodes={heroEpisodes} /> : null}

      <div className="px-pad mx-auto flex w-full max-w-[1440px] flex-col gap-[clamp(26px,3.5vw,38px)] pt-[clamp(20px,3vw,32px)]">
        {hero ? null : (
          <IdleCard
            wantCount={counts.WANT_TO_WATCH}
            watchedCount={counts.WATCHED}
          />
        )}

        <MediaRow
          title={HOME_WATCHING_TITLE}
          note={watchingNote}
          empty={HOME_WATCHING_EMPTY}
          items={watching}
          limit={HOME_RAIL_SIZE}
          seeAllHref={HOME_LIBRARY_HREF}
        />

        <MediaRow
          title={HOME_WANT_TITLE}
          note={wantNote}
          empty={HOME_WANT_EMPTY}
          items={want}
          limit={HOME_RAIL_SIZE}
          seeAllHref={HOME_LIBRARY_HREF}
        />

        <RecentlyWatched items={recent} />
      </div>
    </main>
  );
}
