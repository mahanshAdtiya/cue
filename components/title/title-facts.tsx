import type { ReactNode } from "react";

import {
  MEDIA_GENRE_SEPARATOR,
  MEDIA_SEPARATOR,
  TITLE_FACT_COUNTRY,
  TITLE_FACT_FIRST_AIRED,
  TITLE_FACT_LANGUAGE,
  TITLE_FACT_NEXT_EPISODE,
  TITLE_FACT_RATING,
  TITLE_FACT_RELEASED,
  TITLE_FACT_RUNTIME,
  TITLE_FACT_SEASONS,
  TITLE_FACT_STATUS,
  TITLE_VOTES_UNIT,
} from "@/lib/constants";
import {
  counted,
  episodeCode,
  formatCount,
  mediaExtent,
  mediaRating,
  runtimeLabel,
} from "@/lib/media/display";
import { daysUntil, longDate, relativeDayLabel } from "@/lib/time";
import type { MediaDetails } from "@/lib/tmdb/media";

type Fact = {
  label: string;
  value: ReactNode;
};

function ratingValue(details: MediaDetails): ReactNode {
  const rating = mediaRating(details);
  if (!rating) return null;

  const votes = details.voteCount
    ? counted(details.voteCount, TITLE_VOTES_UNIT).replace(
        String(details.voteCount),
        formatCount(details.voteCount),
      )
    : null;

  return (
    <>
      <span className="text-gold-2 font-mono">{rating}</span>
      {votes ? `${MEDIA_SEPARATOR}${votes}` : null}
    </>
  );
}

function nextEpisodeValue(details: MediaDetails): string | null {
  const next = details.nextEpisode;
  if (!next) return null;

  const code = episodeCode(next.seasonNumber, next.episodeNumber);
  const days = daysUntil(next.airDate);

  if (days === null || days < 0) return code;

  return [code, relativeDayLabel(days)].join(MEDIA_SEPARATOR);
}

function factsOf(details: MediaDetails): Fact[] {
  if (details.type === "MOVIE") {
    return [
      { label: TITLE_FACT_RELEASED, value: longDate(details.releaseDate) },
      {
        label: TITLE_FACT_RUNTIME,
        value: runtimeLabel(details.runtimeMinutes),
      },
      {
        label: TITLE_FACT_LANGUAGE,
        value: details.languages.join(MEDIA_GENRE_SEPARATOR) || null,
      },
      {
        label: TITLE_FACT_COUNTRY,
        value: details.countries.join(MEDIA_GENRE_SEPARATOR) || null,
      },
      { label: TITLE_FACT_RATING, value: ratingValue(details) },
    ];
  }

  return [
    { label: TITLE_FACT_STATUS, value: details.status },
    { label: TITLE_FACT_FIRST_AIRED, value: longDate(details.releaseDate) },
    { label: TITLE_FACT_NEXT_EPISODE, value: nextEpisodeValue(details) },
    { label: TITLE_FACT_SEASONS, value: mediaExtent(details) },
    { label: TITLE_FACT_RATING, value: ratingValue(details) },
  ];
}

export function TitleFacts({ details }: { details: MediaDetails }) {
  const facts = factsOf(details).filter((fact) => fact.value);

  if (facts.length === 0) return null;

  return (
    <dl className="border-line bg-line animate-rise mt-[clamp(18px,2.4vw,28px)] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px border-y">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="bg-bg flex flex-col gap-[7px] px-5 py-[18px]"
        >
          <dt className="text-mut-2 text-micro font-mono tracking-[.2em] uppercase">
            {fact.label}
          </dt>
          <dd className="text-fg text-[15px]">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
