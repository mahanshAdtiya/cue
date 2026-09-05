import { UpcomingSkeleton } from "@/components/explore/upcoming-skeleton";
import { MediaRowSkeleton } from "@/components/media/media-row-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EXPLORE_FILTERS } from "@/lib/constants";

export function ExploreBodySkeleton() {
  return (
    <div className="flex flex-col gap-[clamp(26px,3.6vw,40px)]">
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap gap-2">
            {EXPLORE_FILTERS.map((option) => (
              <Skeleton
                key={option.key}
                h={34}
                shape="pill"
                className="w-[clamp(84px,10vw,116px)]"
              />
            ))}
          </div>
          <Skeleton w={70} h={11} r={4} />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton h={13} r={4} className="w-[min(100%,56ch)]" />
          <Skeleton h={13} r={4} className="w-[min(100%,44ch)]" />
        </div>
      </section>

      <MediaRowSkeleton />
      <MediaRowSkeleton />
      <UpcomingSkeleton />
    </div>
  );
}
