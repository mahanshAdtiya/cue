import type { ComponentProps } from "react";

type IconButtonProps = ComponentProps<"button"> & { "aria-label": string };

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`border-w-10 text-mut hover:border-gold-55 hover:text-gold-2 flex shrink-0 items-center rounded-md border px-3 py-[9px] text-base leading-none transition duration-[var(--dur)] ease-cue ${className ?? ""}`}
      {...props}
    />
  );
}
