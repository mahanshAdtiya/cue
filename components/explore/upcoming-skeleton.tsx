import { Skeleton } from "@/components/ui/skeleton";
import { EXPLORE_UPCOMING_SIZE } from "@/lib/constants";

export function UpcomingSkeleton() {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline gap-3">
        <Skeleton w={210} h={24} r={6} />
        <Skeleton w={190} h={13} r={4} />
        <Skeleton w={54} h={11} r={4} className="ml-auto" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: EXPLORE_UPCOMING_SIZE }, (_, index) => (
          <div
            key={index}
            className="border-w-06 flex items-center gap-3.5 border-b py-3"
          >
            <Skeleton r={5} className="aspect-[2/3] w-9" />
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <Skeleton h={14} r={4} className="w-2/5" />
              <Skeleton h={11} r={4} className="w-1/4" />
            </div>
            <Skeleton w={86} h={40} r={8} />
          </div>
        ))}
      </div>
    </section>
  );
}
