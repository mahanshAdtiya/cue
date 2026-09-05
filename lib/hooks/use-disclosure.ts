"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useDisclosure({ lockScroll = false } = {}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (lockScroll) document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, lockScroll]);

  return { open, close, toggle };
}
