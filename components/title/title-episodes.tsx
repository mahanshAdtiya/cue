import Link from "next/link";

import { EpisodeList } from "@/components/title/episode-list";
import { buttonClass } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  COUNT_TOKEN,
  TITLE_EPISODES_EMPTY,
  TITLE_EPISODES_NOTE,
  TITLE_EPISODES_TITLE,
  TITLE_SEASON_LABEL,
  TITLE_SEASON_PARAM,
} from "@/lib/constants";
import { mediaHref, mediaKey } from "@/lib/media/display";
import type { EpisodeSummary, MediaDetails } from "@/lib/tmdb/media";

type TitleEpisodesProps = {
  details: MediaDetails;
  season: number;
  episodes: EpisodeSummary[];
  watched: number[];
};

export function TitleEpisodes({
  details,
  season,
  episodes,
  watched,
}: TitleEpisodesProps) {
  const seasonBar = details.seasons.length ? (
    <div className="flex flex-wrap items-center gap-2">
      {details.seasons.map((entry) => (
        <Link
          key={entry.number}
          href={`${mediaHref(details)}?${TITLE_SEASON_PARAM}=${entry.number}`}
          scroll={false}
          aria-current={entry.number === season ? "true" : undefined}
          data-selected={entry.number === season || undefined}
          className={buttonClass("pill")}
        >
          {TITLE_SEASON_LABEL.replace(COUNT_TOKEN, String(entry.number))}
        </Link>
      ))}
    </div>
  ) : null;

  if (episodes.length === 0) {
    return (
      <section className="animate-rise flex flex-col gap-3.5">
        <SectionHeader
          title={TITLE_EPISODES_TITLE}
          note={TITLE_EPISODES_NOTE}
        />
        {seasonBar}
        <p className="text-mut-2 text-[13px]">{TITLE_EPISODES_EMPTY}</p>
      </section>
    );
  }

  return (
    <EpisodeList
      mediaKey={mediaKey(details)}
      episodes={episodes}
      watched={watched}
    >
      {seasonBar}
    </EpisodeList>
  );
}
