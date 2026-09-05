import { Skeleton } from "@/components/ui/skeleton";
import { MEDIA_ROW_SKELETON_SLOTS } from "@/lib/constants";

export function MediaRowSkeleton({ note = true }: { note?: boolean }) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline gap-3">
        <Skeleton w={190} h={24} r={6} />
        {note ? <Skeleton w={130} h={13} r={4} /> : null}
      </div>
      <div className="no-scrollbar flex gap-3.5 overflow-hidden pb-1 [&>*]:w-[clamp(112px,15vw,150px)] [&>*]:shrink-0">
        {Array.from({ length: MEDIA_ROW_SKELETON_SLOTS }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton r={8} className="aspect-[2/3] w-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton h={13} r={4} className="w-4/5" />
              <Skeleton h={10} r={4} className="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
