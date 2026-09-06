import { SectionHeader } from "@/components/ui/section-header";
import {
  TITLE_CREDITS_NOTE,
  TITLE_CREDITS_TITLE,
  TITLE_CREDIT_NAME_SEPARATOR,
} from "@/lib/constants";
import type { CreditRow } from "@/lib/tmdb/media";

export function TitleCredits({ credits }: { credits: CreditRow[] }) {
  if (credits.length === 0) return null;

  return (
    <section className="animate-rise flex flex-col gap-3.5">
      <SectionHeader title={TITLE_CREDITS_TITLE} note={TITLE_CREDITS_NOTE} />
      <dl className="border-line bg-line grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-px border-y">
        {credits.map((row) => (
          <div
            key={row.label}
            className="bg-bg flex flex-col gap-1.5 px-5 py-4"
          >
            <dt className="text-mut-2 text-micro font-mono tracking-[.2em] uppercase">
              {row.label}
            </dt>
            <dd className="text-fg text-[15px]">
              {row.names.join(TITLE_CREDIT_NAME_SEPARATOR)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
