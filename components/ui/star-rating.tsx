"use client";

import {
  MEDIA_RATING_GLYPH,
  MEDIA_RATING_STARS,
  COUNT_TOKEN,
  TITLE_RATE_GROUP_LABEL,
  TITLE_STAR_LABEL,
} from "@/lib/constants";

type StarRatingProps = {
  value: number | null;
  disabled?: boolean;
  onRate: (value: number) => void;
};

export function StarRating({ value, disabled, onRate }: StarRatingProps) {
  return (
    <span
      role="group"
      aria-label={TITLE_RATE_GROUP_LABEL}
      className="inline-flex items-center gap-[3px]"
    >
      {Array.from({ length: MEDIA_RATING_STARS }, (_, index) => {
        const star = index + 1;
        const lit = value !== null && star <= value;

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-pressed={lit}
            aria-label={TITLE_STAR_LABEL.replace(
              COUNT_TOKEN,
              String(star),
            )}
            onClick={() => onRate(star)}
            className={`ease-cue px-0.5 py-1.5 text-[19px] leading-none transition duration-[var(--dur)] hover:scale-[1.18] disabled:opacity-60 ${lit ? "text-gold-2" : "text-mut-2"}`}
          >
            {MEDIA_RATING_GLYPH}
          </button>
        );
      })}
    </span>
  );
}
