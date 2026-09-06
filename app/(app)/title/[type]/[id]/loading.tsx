import { Skeleton } from "@/components/ui/skeleton";
import { TITLE_FACT_SLOTS, TITLE_CAST_SLOTS } from "@/lib/constants";

export default function Loading() {
  return (
    <main className="relative flex w-full flex-1 flex-col pb-16">
      <div className="px-pad relative z-[1] mx-auto w-full max-w-[1440px]">
        <section className="mobile:grid-cols-[clamp(150px,34vw,200px)_minmax(0,1fr)] mobile:gap-5 tablet:grid-cols-[clamp(200px,22vw,286px)_minmax(0,1fr)] tablet:gap-[clamp(24px,3.4vw,48px)] grid grid-cols-1 gap-5 pt-[clamp(28px,8vh,92px)] pb-[clamp(26px,3vw,38px)]">
          <div className="mobile:max-w-none w-full max-w-[190px]">
            <Skeleton r={12} className="aspect-[2/3] w-full" />
          </div>

          <div className="flex min-w-0 flex-col gap-3.5 self-end">
            <Skeleton w={150} h={10} r={4} />
            <Skeleton h={72} r={10} className="w-[min(520px,85%)]" />
            <Skeleton w={320} h={11} r={4} />
            <div className="flex max-w-[62ch] flex-col gap-2">
              <Skeleton h={16} r={4} className="w-full" />
              <Skeleton h={16} r={4} className="w-full" />
              <Skeleton h={16} r={4} className="w-2/3" />
            </div>
            <Skeleton h={116} r={14} className="mt-1 w-full" />
          </div>
        </section>

        <div className="border-line bg-line mt-[clamp(18px,2.4vw,28px)] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px border-y">
          {Array.from({ length: TITLE_FACT_SLOTS }, (_, index) => (
            <div
              key={index}
              className="bg-bg flex flex-col gap-[7px] px-5 py-[18px]"
            >
              <Skeleton w={64} h={9} r={3} />
              <Skeleton w={108} h={15} r={4} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-[clamp(30px,4vw,52px)] pt-[clamp(30px,4vw,52px)]">
          <section className="flex flex-col gap-3.5">
            <Skeleton w={130} h={24} r={6} />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(120px,13vw,164px),1fr))] gap-[clamp(12px,1.6vw,20px)]">
              {Array.from({ length: TITLE_CAST_SLOTS }, (_, index) => (
                <div key={index} className="flex flex-col gap-2.5">
                  <Skeleton r={10} className="aspect-square w-full" />
                  <Skeleton h={14} r={4} className="w-4/5" />
                  <Skeleton h={10} r={4} className="w-1/2" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
