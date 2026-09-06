"use client";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";
import { useMediaTracking } from "@/lib/media/use-tracking";

type StatusButtonProps = {
  mediaKey: string;
  status: UserMediaStatus | null;
  isFavorite: boolean;
  variant?: "primary" | "secondary";
  size?: "md" | "sm";
};

export function StatusButton({
  mediaKey,
  status,
  isFavorite,
  variant = "primary",
  size = "md",
}: StatusButtonProps) {
  const { pending, next, advanceStatus } = useMediaTracking({
    mediaKey,
    status,
    isFavorite,
  });

  return (
    <Button
      variant={variant}
      size={size}
      disabled={pending}
      onClick={advanceStatus}
      className="gap-2 disabled:opacity-60"
    >
      <Icon name={next.icon} size={16} />
      {next.label}
    </Button>
  );
}
