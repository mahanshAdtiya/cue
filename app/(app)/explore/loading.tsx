import { ExploreBodySkeleton } from "@/components/explore/explore-body-skeleton";
import { MarqueeSkeleton } from "@/components/explore/marquee-skeleton";

export default function Loading() {
  return (
    <main className="flex w-full flex-1 flex-col gap-[clamp(28px,4vw,48px)] pb-16">
      <MarqueeSkeleton />
      <div className="px-pad mx-auto w-full max-w-[1440px]">
        <ExploreBodySkeleton />
      </div>
    </main>
  );
}
