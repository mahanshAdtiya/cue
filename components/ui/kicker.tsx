import type { ComponentProps } from "react";

export function Kicker({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={`text-gold text-mini font-mono tracking-[.16em] uppercase ${className ?? ""}`}
      {...props}
    />
  );
}
