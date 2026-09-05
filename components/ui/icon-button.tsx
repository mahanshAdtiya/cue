import type { ComponentProps } from "react";

type Shape = "box" | "round";

const BASE =
  "flex shrink-0 items-center justify-center leading-none transition duration-[var(--dur)] ease-cue";

const SHAPES = {
  box: "rounded-md border px-3 py-[9px] text-base",
  round: "size-10 rounded-full border text-[15px]",
} as const;

const STATES = {
  off: "border-w-10 text-mut hover:border-gold-55 hover:text-gold-2 hover:bg-gold-12",
  on: "bg-gold border-gold text-gold-ink hover:bg-gold-btn",
} as const;

export function iconButtonClass(shape: Shape = "box", on = false) {
  return `${BASE} ${SHAPES[shape]} ${STATES[on ? "on" : "off"]}`;
}

type IconButtonProps = ComponentProps<"button"> & {
  "aria-label": string;
  shape?: Shape;
  on?: boolean;
};

export function IconButton({
  shape,
  on,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`${iconButtonClass(shape, on)} ${className ?? ""}`}
      {...props}
    />
  );
}
