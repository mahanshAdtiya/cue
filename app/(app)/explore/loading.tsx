import { ExploreBodySkeleton } from "@/components/explore/explore-body-skeleton";
import { MarqueeSkeleton } from "@/components/explore/marquee-skeleton";

export default function Loading() {
  return (
    <main className="px-pad mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-[clamp(28px,4vw,48px)] pt-(--page-top) pb-16">
      <MarqueeSkeleton />
      <ExploreBodySkeleton />
    </main>
  );
}
