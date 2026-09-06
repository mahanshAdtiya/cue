"use client";

import Link from "next/link";
import { useEffect, useRef, useTransition } from "react";

import { logout } from "@/actions/auth";
import { RouteLoad } from "@/components/layout/route-load";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { SIGNED_OUT_TOAST } from "@/lib/constants";
import { useDisclosure } from "@/lib/hooks/use-disclosure";
import { toast } from "@/lib/toast/store";

const ROW =
  "border-line hover:bg-w-04 hover:text-gold-2 text-fg group flex min-h-[62px] w-full items-center border-b px-[18px] font-mono text-sm tracking-[.08em] uppercase last:border-b-0";
const GLYPH =
  "text-mut-2 group-hover:text-gold-2 ml-auto transition duration-[var(--dur)] ease-cue group-hover:translate-x-1";

export function AvatarMenu({ name, email }: { name: string; email: string }) {
  const { open, close, toggle } = useDisclosure();
  const root = useRef<HTMLDivElement>(null);
  const [signingOut, startSignOut] = useTransition();

  const signOut = () =>
    startSignOut(async () => {
      toast.show(SIGNED_OUT_TOAST);
      await logout();
    });

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  return (
    <div ref={root} className="relative flex">
      <button
        type="button"
        onClick={toggle}
        aria-label="Account"
        aria-expanded={open}
        aria-controls="avatar-menu"
        className="rounded-full"
      >
        <Avatar name={name} />
      </button>

      {open && (
        <div
          id="avatar-menu"
          className="border-line-2 bg-bg-2 animate-pop absolute top-full right-0 z-10 mt-2.5 flex w-[min(300px,86vw)] origin-top-right flex-col overflow-hidden rounded-xl border shadow-[0_30px_70px_rgba(0,0,0,.6)]"
        >
          <div className="border-line flex flex-col gap-1.5 border-b px-[18px] py-4">
            <span className="text-gold font-mono text-mini tracking-[.2em] uppercase">
              Signed in
            </span>
            <strong className="font-serif text-[22px] leading-tight font-normal">
              {name}
            </strong>
            <span className="text-mut text-[13px] break-all">{email}</span>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className={ROW}
          >
            {signingOut ? "Logging out…" : "Log out"}
            <Icon name="arrow-right" size={16} className={GLYPH} />
          </button>
        </div>
      )}
    </div>
  );
}
