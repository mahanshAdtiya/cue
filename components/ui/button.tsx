import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger" | "pill";
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
  /* Destructive twin of `secondary`: same box, no gold anywhere, so the
     danger colour is not competing with a gold hover further down the sheet. */
  danger: {
    base: "border-line-2 text-mut hover:border-danger hover:text-danger rounded-md border font-medium active:translate-y-px",
    md: "min-h-11 px-4.5 py-[13px] text-sm",
    sm: "min-h-10 px-4 py-2.5 text-[13px]",
  },
  pill: {
    base: "border-line-2 text-mut hover:border-line-3 hover:text-fg data-selected:bg-gold data-selected:border-gold data-selected:text-gold-ink data-selected:hover:text-gold-ink rounded-pill border font-medium whitespace-nowrap",
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
  selected?: boolean;
};

export function Button({
  variant,
  size,
  selected,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      data-selected={selected || undefined}
      className={`${buttonClass(variant, size)} ${className ?? ""}`}
      {...props}
    />
  );
}
