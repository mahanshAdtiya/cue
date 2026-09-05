import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button">;

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-md bg-gold px-4.5 py-[13px] text-sm font-semibold text-gold-ink transition duration-[var(--dur)] ease-cue hover:bg-gold-btn active:translate-y-px disabled:hover:bg-gold ${className ?? ""}`}
      {...props}
    />
  );
}
