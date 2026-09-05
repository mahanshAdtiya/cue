"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Toast } from "@/components/ui/toast";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/toast/store";

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!toasts.length) return null;

  return createPortal(
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="max-mobile:right-3 max-mobile:left-3 max-mobile:w-auto pointer-events-none fixed right-[clamp(12px,3vw,28px)] bottom-[clamp(12px,3vh,28px)] z-[120] flex w-[min(430px,calc(100vw-24px))] flex-col gap-2.5"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  );
}
