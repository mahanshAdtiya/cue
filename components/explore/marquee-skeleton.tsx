import { Skeleton } from "@/components/ui/skeleton";
import { EXPLORE_MARQUEE_SKELETON_ROWS } from "@/lib/constants";

export function MarqueeSkeleton() {
  return (
    <section className="border-line -mx-pad -mt-(--page-top) px-pad desktop:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] desktop:min-h-[clamp(520px,76vh,760px)] desktop:gap-[clamp(24px,4vw,56px)] grid grid-cols-1 content-center gap-0 border-b">
      <div className="desktop:py-[clamp(40px,7vh,84px)] flex min-w-0 flex-col gap-[clamp(14px,2vw,20px)] py-[clamp(36px,6vh,64px)]">
        <Skeleton w={190} h={10} r={4} />
        <Skeleton
          r={8}
          className="h-[clamp(46px,8.5vw,104px)] w-[min(100%,9ch)]"
        />
        <Skeleton w={280} h={11} r={4} />
        <div className="flex flex-col gap-2">
          <Skeleton h={16} r={4} className="w-[min(100%,50ch)]" />
          <Skeleton h={16} r={4} className="w-[min(100%,42ch)]" />
        </div>
        <div className="mt-1 flex gap-2.5">
          <Skeleton w={160} h={44} r={8} />
          <Skeleton w={120} h={44} r={8} />
        </div>
      </div>

      <div className="desktop:border-line desktop:py-[clamp(28px,5vh,64px)] desktop:pl-[clamp(18px,2.4vw,32px)] flex flex-col justify-center gap-0.5 pb-[clamp(28px,5vh,48px)] desktop:border-l desktop:pb-0">
        <Skeleton w={210} h={9} r={4} className="mb-3.5" />
        {Array.from({ length: EXPLORE_MARQUEE_SKELETON_ROWS }, (_, index) => (
          <div
            key={index}
            className="border-w-06 flex min-h-14 items-center gap-3.5 border-t py-[15px] last:border-b"
          >
            <Skeleton w={22} h={10} r={4} />
            <Skeleton h={15} r={4} className="w-2/5" />
            <Skeleton w={54} h={10} r={4} className="ml-auto" />
          </div>
        ))}
      </div>
    </section>
  );
}
