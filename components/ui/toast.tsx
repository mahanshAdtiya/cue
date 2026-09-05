"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { TOAST_EXIT_MS, TOAST_KINDS } from "@/lib/constants";
import { dismiss, type ToastData } from "@/lib/toast/store";

const KINDS = {
  success: { accent: "[--accent:var(--color-gold)]", label: "text-[var(--accent)]" },
  error: { accent: "[--accent:var(--color-danger)]", label: "text-[var(--accent)]" },
  info: { accent: "[--accent:var(--color-mut)]", label: "text-mut-2" },
} as const;

const ACTION =
  "text-fg hover:text-[var(--accent)] ease-cue mt-0.5 self-start border-b border-current pb-[3px] font-mono text-mini tracking-[.14em] uppercase transition-colors duration-[var(--dur)]";

export function Toast({ toast }: { toast: ToastData }) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);

  const kind = KINDS[toast.kind];
  const { icon, label } = TOAST_KINDS[toast.kind];

  useEffect(() => {
    if (!toast.duration || paused || leaving) return;

    const startedAt = Date.now();
    const timer = setTimeout(() => setLeaving(true), remaining.current);

    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [toast.duration, paused, leaving]);

  useEffect(() => {
    if (!leaving) return;

    const timer = setTimeout(() => dismiss(toast.id), TOAST_EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving, toast.id]);

  const action = toast.action;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`border-line-2 bg-bg-3 text-fg pointer-events-auto relative grid grid-cols-[auto_1fr_auto] items-start gap-3.5 overflow-hidden rounded-[10px] border border-l-2 border-l-[var(--accent)] pt-4 pr-4 pb-[17px] pl-[18px] shadow-[0_22px_50px_rgba(0,0,0,.5)] ${kind.accent} ${leaving ? "animate-toast-out" : "animate-toast-in"}`}
    >
      <span
        aria-hidden
        className="mt-px grid size-[22px] place-items-center text-[var(--accent)]"
      >
        <Icon name={icon} size={17} />
      </span>

      <div className="flex min-w-0 flex-col gap-[7px]">
        <span
          className={`font-mono text-mini tracking-[.16em] uppercase ${kind.label}`}
        >
          {toast.label ?? label}
        </span>
        <p className="text-fg text-sm leading-normal">{toast.message}</p>

        {action ? (
          action.href ? (
            <a
              href={action.href}
              className={ACTION}
            >
              {action.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                action.onClick?.();
                setLeaving(true);
              }}
              className={ACTION}
            >
              {action.label}
            </button>
          )
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setLeaving(true)}
        className="text-mut hover:text-fg hover:bg-w-06 ease-cue -mt-1 -mr-1 grid size-8 place-items-center rounded-sm transition duration-[var(--dur)]"
      >
        <Icon name="close" size={15} />
      </button>

      {toast.duration ? (
        <span
          aria-hidden
          className="animate-toast-shrink absolute bottom-0 left-0 h-0.5 w-full origin-left bg-[var(--accent)]"
          style={{
            animationDuration: `${toast.duration}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      ) : null}
    </div>
  );
}
