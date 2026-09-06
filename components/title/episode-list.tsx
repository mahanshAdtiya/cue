"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition, type ReactNode } from "react";

import { setEpisodeWatched } from "@/actions/user-media";
import { SectionHeader } from "@/components/ui/section-header";
import {
  COUNT_TOKEN,
  EPISODE_UNWATCHED_TOAST,
  EPISODE_WATCHED_TOAST,
  TITLE_EPISODES_COUNTER,
  TITLE_EPISODES_NOTE,
  TITLE_EPISODES_TITLE,
  TITLE_EPISODES_UNAIRED,
  TITLE_EPISODE_MARK_LABEL,
  TITLE_EPISODE_UNMARK_LABEL,
  TOTAL_TOKEN,
} from "@/lib/constants";
import { episodeCode } from "@/lib/media/display";
import { shortDate } from "@/lib/time";
import { toast } from "@/lib/toast/store";
import type { EpisodeSummary } from "@/lib/tmdb/media";

type EpisodeListProps = {
  mediaKey: string;
  episodes: EpisodeSummary[];
  watched: number[];
  children?: ReactNode;
};

function counter(watched: number, total: number): string {
  return TITLE_EPISODES_COUNTER.replace(COUNT_TOKEN, String(watched)).replace(
    TOTAL_TOKEN,
    String(total),
  );
}

export function EpisodeList({
  mediaKey,
  episodes,
  watched,
  children,
}: EpisodeListProps) {
  const [marked, showMarked] = useOptimistic(watched);
  const seen = new Set(marked);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(episode: EpisodeSummary) {
    const wanted = !seen.has(episode.episodeNumber);

    startTransition(async () => {
      showMarked((current) =>
        wanted
          ? [...current, episode.episodeNumber]
          : current.filter((number) => number !== episode.episodeNumber),
      );

      const state = await setEpisodeWatched({
        mediaKey,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        watched: wanted,
      });

      if (state.error) {
        toast.err(state.error);
        if (state.redirectTo) router.push(state.redirectTo);
        return;
      }

      toast.show(wanted ? EPISODE_WATCHED_TOAST : EPISODE_UNWATCHED_TOAST);
      router.refresh();
    });
  }

  return (
    <section className="animate-rise flex flex-col gap-3.5">
      <SectionHeader
        title={TITLE_EPISODES_TITLE}
        note={TITLE_EPISODES_NOTE}
        action={
          <span className="text-mut-2 text-mini font-mono tracking-[.14em] uppercase">
            {counter(seen.size, episodes.length)}
          </span>
        }
      />

      {children}

      <div className="border-line flex flex-col border-t">
        {episodes.map((episode) => {
          const isSeen = seen.has(episode.episodeNumber);
          const label = isSeen
            ? TITLE_EPISODE_UNMARK_LABEL
            : TITLE_EPISODE_MARK_LABEL;

          return (
            <button
              key={episode.episodeNumber}
              type="button"
              disabled={pending}
              aria-pressed={isSeen}
              aria-label={`${label} ${episode.title}`}
              onClick={() => toggle(episode)}
              className={`border-line hover:bg-w-04 tablet:grid-cols-[74px_108px_minmax(0,1fr)_auto] ease-cue group grid min-h-[60px] grid-cols-[74px_minmax(0,1fr)_auto] items-center gap-4 border-b px-1.5 py-[15px] text-left transition-[padding-left,background-color,color] duration-[var(--dur)] hover:pl-3.5 disabled:opacity-60 ${isSeen ? "text-mut" : "text-fg-2 hover:text-fg"}`}
            >
              <span className="text-mut-2 text-label font-mono tracking-[.1em] whitespace-nowrap">
                {episodeCode(episode.seasonNumber, episode.episodeNumber)}
              </span>
              <span className="text-mut-2 text-mini tablet:block hidden font-mono tracking-[.1em] uppercase">
                {shortDate(episode.airDate) ?? TITLE_EPISODES_UNAIRED}
              </span>
              <span className="truncate text-[15px]">{episode.title}</span>
              <span
                aria-hidden
                className={`ease-cue grid size-[22px] place-items-center rounded-full border text-[11px] transition duration-[var(--dur)] ${isSeen ? "bg-gold border-gold text-gold-ink" : "border-line-2 group-hover:border-gold-55 text-transparent"}`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
