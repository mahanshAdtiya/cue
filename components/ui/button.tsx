import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "pill";
type Size = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center transition duration-[var(--dur)] ease-cue";

const VARIANTS = {
  primary: {
    base: "bg-gold text-gold-ink hover:bg-gold-btn disabled:hover:bg-gold rounded-md font-semibold active:translate-y-px",
    md: "min-h-11 px-4.5 py-[13px] text-sm",
    sm: "min-h-10 px-4 py-2.5 text-[13px]",
  },
  /* Primary's twin: same box, bordered instead of filled, for the second-choice
     action beside it. Distinct from `pill`, which is the small top-bar chip. */
  secondary: {
    base: "border-line-2 text-fg-2 hover:border-gold-55 hover:text-gold-2 rounded-md border font-medium active:translate-y-px",
    md: "min-h-11 px-4.5 py-[13px] text-sm",
    sm: "min-h-10 px-4 py-2.5 text-[13px]",
  },
  pill: {
    base: "border-line-2 text-mut hover:text-fg rounded-pill border font-medium whitespace-nowrap",
    md: "px-3.5 py-[9px] text-xs",
    sm: "min-h-10 px-4 py-2.5 text-[13px]",
  },
} as const;

export function buttonClass(variant: Variant = "primary", size: Size = "md") {
  return `${BASE} ${VARIANTS[variant].base} ${VARIANTS[variant][size]}`;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={`${buttonClass(variant, size)} ${className ?? ""}`}
      {...props}
    />
  );
}
