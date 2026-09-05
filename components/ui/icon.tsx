import type { SVGProps } from "react";

import { ICON_PATHS, ICON_SIZE, ICON_STROKE, ICON_VIEWBOX, type IconName } from "@/lib/icons";

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
  filled?: boolean;
};

export function Icon({
  name,
  size = ICON_SIZE,
  filled = false,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={ICON_VIEWBOX}
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className ?? ""}`}
      {...props}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
