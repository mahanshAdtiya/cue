import { Suspense } from "react";

import { ExploreBody } from "@/components/explore/explore-body";
import { Marquee } from "@/components/explore/marquee";
import { MarqueeSkeleton } from "@/components/explore/marquee-skeleton";
import { SectionBoundary } from "@/components/ui/section-boundary";
import {
  EXPLORE_FILTERS,
  EXPLORE_FILTER_DEFAULT,
  EXPLORE_FILTER_PARAM,
  EXPLORE_MARQUEE_EYEBROW,
  EXPLORE_SECTION_ERROR,
  type ExploreFilter,
} from "@/lib/constants";
import { getMarquee } from "@/lib/tmdb/queries";

function toFilter(value: string | string[] | undefined): ExploreFilter {
  const match = EXPLORE_FILTERS.find((option) => option.key === value);
  return match ? match.key : EXPLORE_FILTER_DEFAULT;
}

async function MarqueeSection() {
  return <Marquee items={await getMarquee()} />;
}

export default async function Explore({ searchParams }: PageProps<"/explore">) {
  const filter = toFilter((await searchParams)[EXPLORE_FILTER_PARAM]);

  return (
    <main className="px-pad mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-[clamp(28px,4vw,48px)] pt-(--page-top) pb-16">
      <SectionBoundary
        title={EXPLORE_MARQUEE_EYEBROW}
        message={EXPLORE_SECTION_ERROR}
      >
        <Suspense fallback={<MarqueeSkeleton />}>
          <MarqueeSection />
        </Suspense>
      </SectionBoundary>
      <ExploreBody filter={filter} />
    </main>
  );
}
