import {
  EMPTY_TOASTS,
  TOAST_DURATION_MS,
  TOAST_MAX,
  type ToastKind,
} from "@/lib/constants";

export type ToastAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type ToastData = {
  id: number;
  kind: ToastKind;
  label?: string;
  message: string;
  action?: ToastAction;
  duration: number;
};

export type ToastOptions = {
  label?: string;
  action?: ToastAction;
  duration?: number;
};

let toasts: readonly ToastData[] = EMPTY_TOASTS;
let nextId = 0;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return toasts;
}

export function getServerSnapshot(): readonly ToastData[] {
  return EMPTY_TOASTS;
}

export function dismiss(id: number) {
  const next = toasts.filter((entry) => entry.id !== id);
  if (next.length === toasts.length) return;
  toasts = next.length ? next : EMPTY_TOASTS;
  emit();
}

function push(kind: ToastKind, message: string, options: ToastOptions = {}) {
  const entry: ToastData = {
    id: nextId++,
    kind,
    message,
    duration: options.duration ?? TOAST_DURATION_MS,
    label: options.label,
    action: options.action,
  };

  toasts = [...toasts, entry].slice(-TOAST_MAX);
  emit();
  return entry.id;
}

export const toast = {
  ok: (message: string, options?: ToastOptions) =>
    push("success", message, options),
  err: (message: string, options?: ToastOptions) =>
    push("error", message, options),
  info: (message: string, options?: ToastOptions) =>
    push("info", message, options),
  show: ({
    kind = "success",
    message,
    ...options
  }: ToastOptions & { kind?: ToastKind; message: string }) =>
    push(kind, message, options),
  dismiss,
  clear: () => {
    if (!toasts.length) return;
    toasts = EMPTY_TOASTS;
    emit();
  },
};
