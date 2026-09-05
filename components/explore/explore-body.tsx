import { Suspense } from "react";

import { ExploreFilters } from "@/components/explore/explore-filters";
import { TopRatedSection } from "@/components/explore/top-rated-section";
import { TrendingSection } from "@/components/explore/trending-section";
import { UpcomingSection } from "@/components/explore/upcoming-section";
import { UpcomingSkeleton } from "@/components/explore/upcoming-skeleton";
import { MediaRowSkeleton } from "@/components/media/media-row-skeleton";
import { SectionBoundary } from "@/components/ui/section-boundary";
import {
  EXPLORE_SECTION_ERROR,
  EXPLORE_TOP_NOTE,
  EXPLORE_TOP_TITLE,
  EXPLORE_TRENDING_NOTE,
  EXPLORE_TRENDING_TITLE,
  EXPLORE_UPCOMING_NOTE,
  EXPLORE_UPCOMING_TITLE,
} from "@/lib/constants";

export function ExploreBody() {
  return (
    <ExploreFilters>
      <div data-explore-section className="animate-rise">
        <SectionBoundary
          title={EXPLORE_TRENDING_TITLE}
          note={EXPLORE_TRENDING_NOTE}
          message={EXPLORE_SECTION_ERROR}
        >
          <Suspense fallback={<MediaRowSkeleton />}>
            <TrendingSection />
          </Suspense>
        </SectionBoundary>
      </div>

      <div data-explore-section className="animate-rise">
        <SectionBoundary
          title={EXPLORE_TOP_TITLE}
          note={EXPLORE_TOP_NOTE}
          message={EXPLORE_SECTION_ERROR}
        >
          <Suspense fallback={<MediaRowSkeleton />}>
            <TopRatedSection />
          </Suspense>
        </SectionBoundary>
      </div>

      <div data-explore-section className="animate-rise">
        <SectionBoundary
          title={EXPLORE_UPCOMING_TITLE}
          note={EXPLORE_UPCOMING_NOTE}
          message={EXPLORE_SECTION_ERROR}
        >
          <Suspense fallback={<UpcomingSkeleton />}>
            <UpcomingSection />
          </Suspense>
        </SectionBoundary>
      </div>
    </ExploreFilters>
  );
}
