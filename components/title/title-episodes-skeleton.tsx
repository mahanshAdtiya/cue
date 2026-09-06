import { Skeleton } from "@/components/ui/skeleton";
import { TITLE_EPISODE_SKELETON_ROWS } from "@/lib/constants";

export function TitleEpisodesSkeleton() {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline gap-3">
        <Skeleton w={130} h={24} r={6} />
        <Skeleton w={180} h={13} r={4} />
        <Skeleton w={110} h={11} r={4} className="ml-auto" />
      </div>
      <div className="border-line flex flex-col border-t">
        {Array.from({ length: TITLE_EPISODE_SKELETON_ROWS }, (_, index) => (
          <div
            key={index}
            className="border-line tablet:grid-cols-[74px_108px_minmax(0,1fr)_auto] grid min-h-[60px] grid-cols-[74px_minmax(0,1fr)_auto] items-center gap-4 border-b px-1.5 py-[15px]"
          >
            <Skeleton w={58} h={11} r={4} />
            <Skeleton w={84} h={10} r={4} className="tablet:block hidden" />
            <Skeleton h={15} r={4} className="w-3/5" />
            <Skeleton shape="round" w={22} h={22} />
          </div>
        ))}
      </div>
    </section>
  );
}
