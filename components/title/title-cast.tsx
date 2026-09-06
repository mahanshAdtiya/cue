import Image from "next/image";
import type { CSSProperties } from "react";

import { SectionHeader } from "@/components/ui/section-header";
import {
  TITLE_CAST_NOTE,
  TITLE_CAST_SIZES,
  TITLE_CAST_TITLE,
} from "@/lib/constants";
import { hueOf } from "@/lib/media/display";
import type { CastMember } from "@/lib/tmdb/media";

export function TitleCast({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;

  return (
    <section className="animate-rise flex flex-col gap-3.5">
      <SectionHeader title={TITLE_CAST_TITLE} note={TITLE_CAST_NOTE} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(120px,13vw,164px),1fr))] gap-[clamp(12px,1.6vw,20px)]">
        {cast.map((member) => (
          <div key={member.id} className="group flex flex-col gap-2.5">
            <span
              style={{ "--h": hueOf(member.id) } as CSSProperties}
              className="border-line ease-cue text-w-34 relative grid aspect-square place-items-center overflow-hidden rounded-[10px] border bg-[hsl(var(--h)_22%_14%)] font-serif text-3xl transition duration-[var(--dur)] group-hover:-translate-y-[5px] group-hover:border-[var(--color-gold-55)]"
            >
              {member.profileUrl ? (
                <Image
                  src={member.profileUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes={TITLE_CAST_SIZES}
                  className="object-cover object-top"
                />
              ) : (
                member.name.slice(0, 1)
              )}
            </span>
            <b className="text-fg text-sm leading-tight font-medium">
              {member.name}
            </b>
            {member.role ? (
              <span className="text-mut-2 text-mini font-mono tracking-[.1em] uppercase">
                {member.role}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
