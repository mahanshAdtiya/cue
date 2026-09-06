import { TitleBackdrop } from "@/components/title/title-backdrop";
import { TitleHero } from "@/components/title/title-hero";
import type { TitleProgress } from "@/components/title/title-tracking";
import { HOME_HERO_KICKER } from "@/lib/constants";
import { episodeCode, hueOf } from "@/lib/media/display";
import { toHeroTracking, toLibraryHero } from "@/lib/media/hero";
import type { LibraryMedia } from "@/lib/media/library";

type HomeHeroProps = {
  item: LibraryMedia;
  watchedEpisodes: number;
};

function progressOf(
  item: LibraryMedia,
  watchedEpisodes: number,
): TitleProgress | null {
  if (item.type === "MOVIE" || !item.episodeCount) return null;

  const position =
    item.currentSeason && item.currentEpisode
      ? episodeCode(item.currentSeason, item.currentEpisode)
      : null;

  return { watched: watchedEpisodes, total: item.episodeCount, position };
}

export function HomeHero({ item, watchedEpisodes }: HomeHeroProps) {
  return (
    <section className="relative">
      <TitleBackdrop src={item.backdropUrl} hue={hueOf(item.externalId)} />

      <div className="px-pad relative z-[1] mx-auto w-full max-w-[1440px]">
        <TitleHero
          linked
          media={toLibraryHero(item, HOME_HERO_KICKER)}
          tracking={toHeroTracking(item, {
            status: item.status,
            isFavorite: item.isFavorite,
            rating: item.rating,
            watches: 0,
            progress: progressOf(item, watchedEpisodes),
          })}
        />
      </div>
    </section>
  );
}
