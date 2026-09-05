type Shape = "block" | "pill" | "round";

const SHAPES = {
  block: "rounded-sm",
  pill: "rounded-pill",
  round: "rounded-full",
} as const;

type SkeletonProps = {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  shape?: Shape;
  className?: string;
};

const px = (value: number | string | undefined) =>
  typeof value === "number" ? `${value}px` : value;

export function Skeleton({ w, h, r, shape = "block", className }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={{ width: px(w), height: px(h), borderRadius: px(r) }}
      className={`bg-bg-3 border-line sweep inline-block shrink-0 border ${SHAPES[shape]} ${className ?? ""}`}
    />
  );
}
