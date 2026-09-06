import Link from "next/link";

import { Poster } from "@/components/media/poster";
import { SectionHeader } from "@/components/ui/section-header";
import {
  HOME_RECENT_EMPTY,
  HOME_RECENT_SIZES,
  HOME_RECENT_TITLE,
} from "@/lib/constants";
import {
  hueOf,
  mediaHref,
  mediaKey,
  mediaSub,
  starString,
} from "@/lib/media/display";
import type { LibraryMedia } from "@/lib/media/library";

export function RecentlyWatched({ items }: { items: LibraryMedia[] }) {
  return (
    <section className="flex flex-col gap-3.5">
      <SectionHeader title={HOME_RECENT_TITLE} />

      {items.length ? (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={mediaKey(item)}
              className="border-w-06 ease-cue hover:bg-w-02 flex items-center gap-3.5 border-b py-2.5 transition-colors duration-[var(--dur)]"
            >
              <Link href={mediaHref(item)} className="block w-9 shrink-0">
                <Poster
                  src={item.posterUrl}
                  title={item.title}
                  hue={hueOf(item.externalId)}
                  sizes={HOME_RECENT_SIZES}
                  caption={false}
                />
              </Link>

              <Link
                href={mediaHref(item)}
                className="flex min-w-0 flex-1 flex-col gap-1"
              >
                <span className="text-fg hover:text-gold-2 truncate text-sm font-medium">
                  {item.title}
                </span>
                <span className="text-(color:--color-cap) text-label font-mono tracking-[.08em] uppercase">
                  {mediaSub(item)}
                </span>
              </Link>

              <span className="text-gold shrink-0 text-[13px] tracking-[.08em]">
                {starString(item.rating)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-mut-2 text-[13px]">{HOME_RECENT_EMPTY}</p>
      )}
    </section>
  );
}
