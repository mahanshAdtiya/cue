"use client";

import { Button } from "@/components/ui/button";
import { MEDIA_ACTION_PENDING } from "@/lib/constants";
import { toast } from "@/lib/toast/store";

type Variant = "primary" | "secondary";
type Size = "md" | "sm";

type TrackButtonProps = {
  label: string;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function TrackButton({
  label,
  variant = "primary",
  size = "md",
  className,
}: TrackButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => toast.show(MEDIA_ACTION_PENDING)}
    >
      {label}
    </Button>
  );
}
