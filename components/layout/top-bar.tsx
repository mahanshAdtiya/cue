import Link from "next/link";
import type { ReactNode } from "react";

import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { NavLinks } from "@/components/layout/nav-links";
import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export function TopBar({ children }: { children: ReactNode }) {
  return (
    <header className="border-line bg-veil px-pad mobile:h-[62px] mobile:gap-[clamp(12px,2vw,26px)] sticky top-0 z-40 flex h-14 items-center gap-2.5 border-b backdrop-blur-[8px]">
      <Link href="/" className="text-fg hover:text-fg font-serif text-[25px]">
        Cue
      </Link>
      {children}
    </header>
  );
}

export function TopBarSession({ user }: { user: { name: string } | null }) {
  if (!user) {
    return (
      <div className="ml-auto flex items-center gap-2.5">
        <Link href="/signin" className={buttonClass("pill", "sm")}>
          Sign in
        </Link>
        <Link href="/signup" className={buttonClass("primary", "sm")}>
          Create account
        </Link>
      </div>
    );
  }

  return (
    <>
      <NavLinks />
      <div className="mobile:gap-[clamp(12px,2vw,26px)] ml-auto flex items-center gap-2.5">
        <IconButton aria-label="Search">⌕</IconButton>
        <Link href="/profile" aria-label="Profile">
          <Avatar name={user.name} />
        </Link>
        <MobileDrawer />
      </div>
    </>
  );
}

export function TopBarSessionFallback() {
  return (
    <div
      aria-hidden
      className="bg-w-04 ml-auto h-10 w-24 animate-pulse rounded-md"
    />
  );
}
