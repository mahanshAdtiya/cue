import type { ReactNode } from "react";

type Align = "start" | "center" | "end";

const ALIGNMENTS = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
} as const satisfies Record<Align, string>;

type TooltipProps = {
  label: string;
  children: ReactNode;
  align?: Align;
  className?: string;
};

export function Tooltip({
  label,
  children,
  align = "center",
  className,
}: TooltipProps) {
  return (
    <span className={`group/tooltip relative inline-flex ${className ?? ""}`}>
      {children}
      <span
        aria-hidden
        className={`${ALIGNMENTS[align]} border-line-2 bg-overlay text-fg-2 text-label ease-cue pointer-events-none absolute bottom-full z-10 mb-2 rounded-sm border px-2 py-1 whitespace-nowrap opacity-0 shadow-[0_8px_20px_rgba(0,0,0,.5)] transition-opacity duration-[var(--dur)] group-hover/tooltip:opacity-100 group-hover/tooltip:delay-300 group-focus-within/tooltip:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}
