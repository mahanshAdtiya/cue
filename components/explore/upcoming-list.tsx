import Link from "next/link";

import { Poster } from "@/components/media/poster";
import { TrackButton } from "@/components/media/track-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  EXPLORE_UPCOMING_EMPTY,
  EXPLORE_UPCOMING_HREF,
  EXPLORE_UPCOMING_NOTE,
  EXPLORE_UPCOMING_SIZES,
  EXPLORE_UPCOMING_TITLE,
  EXPLORE_UPCOMING_TRACK,
  MEDIA_ROW_SEE_ALL,
  MEDIA_SEPARATOR,
} from "@/lib/constants";
import {
  episodeCode,
  hueOf,
  mediaHref,
  mediaKey,
} from "@/lib/media/display";
import type { UpcomingEpisode } from "@/lib/tmdb/media";
import { daysUntil, relativeDayLabel } from "@/lib/time";

function airLine(episode: UpcomingEpisode): string {
  const days = daysUntil(episode.airDate);
  const code = episodeCode(episode.seasonNumber, episode.episodeNumber);

  return days === null
    ? code
    : [code, relativeDayLabel(days)].join(MEDIA_SEPARATOR);
}

export function UpcomingList({ episodes }: { episodes: UpcomingEpisode[] }) {
  return (
    <section className="flex flex-col gap-3.5">
      <SectionHeader
        title={EXPLORE_UPCOMING_TITLE}
        note={EXPLORE_UPCOMING_NOTE}
        action={
          <Link href={EXPLORE_UPCOMING_HREF} className="mono hover:text-gold-2">
            {MEDIA_ROW_SEE_ALL}
          </Link>
        }
      />
      {episodes.length ? (
        <div className="flex flex-col">
          {episodes.map((episode) => {
            const href = mediaHref(episode.media);
            return (
              <div
                key={mediaKey(episode.media)}
                className="border-w-06 flex items-center gap-3.5 border-b py-3"
              >
                <Link href={href} className="w-9 shrink-0">
                  <Poster
                    src={episode.media.posterUrl}
                    title={episode.media.title}
                    hue={hueOf(episode.media.externalId)}
                    sizes={EXPLORE_UPCOMING_SIZES}
                    caption={false}
                    className="rounded-xs"
                  />
                </Link>
                <Link
                  href={href}
                  className="text-fg hover:text-gold-2 flex min-w-0 flex-1 flex-col gap-[5px]"
                >
                  <b className="truncate text-sm font-medium">
                    {episode.media.title}
                  </b>
                  <span className="text-(color:--color-label) text-label font-mono tracking-[.08em] uppercase">
                    {airLine(episode)}
                  </span>
                </Link>
                <TrackButton
                  label={EXPLORE_UPCOMING_TRACK}
                  variant="secondary"
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-mut-2 text-[13px]">{EXPLORE_UPCOMING_EMPTY}</p>
      )}
    </section>
  );
}
