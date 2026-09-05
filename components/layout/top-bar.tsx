import Link from "next/link";
import type { ReactNode } from "react";

import { AvatarMenu } from "@/components/layout/avatar-menu";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { NavLinks } from "@/components/layout/nav-links";
import { buttonClass } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { NAV_LINKS, TOP_BAR_SKELETON } from "@/lib/constants";

export function TopBar({ children }: { children: ReactNode }) {
  return (
    <header className="border-line bg-veil-4 px-pad mobile:h-[62px] mobile:gap-[clamp(12px,2vw,26px)] sticky top-0 z-40 flex h-14 items-center gap-2.5 border-b backdrop-blur-[8px]">
      <Link href="/" className="text-fg hover:text-fg font-serif text-[25px]">
        Cue
      </Link>
      {children}
    </header>
  );
}

export function TopBarSession({
  user,
}: {
  user: { name: string; email: string } | null;
}) {
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
        <AvatarMenu name={user.name} email={user.email} />
        <MobileDrawer />
      </div>
    </>
  );
}

/* Stands in for <TopBarSession> while getCurrentUser() resolves. It has to pick a
   branch before the answer is known: shell.js picks the signed-in shape, so we do
   too. Everything left of the right cluster holds still either way — only the
   cluster itself widens if the visitor turns out to be anonymous. */
export function TopBarSessionFallback() {
  const { nav, icon, avatar } = TOP_BAR_SKELETON;

  return (
    <>
      <span
        aria-hidden
        className="tablet:flex hidden shrink-0 gap-[clamp(14px,2vw,24px)]"
      >
        {NAV_LINKS.map((link) => (
          <Skeleton key={link.href} w={nav.w[link.href]} h={nav.h} />
        ))}
      </span>

      <span
        role="status"
        aria-label="Checking session"
        className="mobile:gap-[clamp(12px,2vw,26px)] ml-auto flex items-center gap-2.5"
      >
        <Skeleton w={icon.w} h={icon.h} r="var(--radius-md)" />
        <Skeleton w={avatar} h={avatar} shape="round" />
        <Skeleton
          w={icon.w}
          h={icon.h}
          r="var(--radius-md)"
          className="tablet:hidden"
        />
      </span>
    </>
  );
}
