import type { ComponentProps } from "react";

type Tone = "gold" | "mut";

const TONES = {
  gold: "border-gold-28 text-gold-2",
  mut: "border-line-2 text-mut-2",
} as const;

type BadgeProps = ComponentProps<"span"> & { tone?: Tone };

export function Badge({ tone = "mut", className, ...props }: BadgeProps) {
  return (
    <span
      className={`text-mini rounded-pill shrink-0 border px-2 py-[3px] font-mono tracking-[.14em] uppercase ${TONES[tone]} ${className ?? ""}`}
      {...props}
    />
  );
}
