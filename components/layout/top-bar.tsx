import Link from "next/link";

import { AvatarMenu } from "@/components/layout/avatar-menu";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { NavLinks } from "@/components/layout/nav-links";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";

export function TopBar({ user }: { user: { name: string; email: string } }) {
  return (
    <header className="border-line bg-veil-4 px-pad mobile:h-[62px] mobile:gap-[clamp(12px,2vw,26px)] sticky top-0 z-40 flex h-14 items-center gap-2.5 border-b backdrop-blur-[8px]">
      <Link href="/home" className="text-fg hover:text-fg font-serif text-[25px]">
        Cue
      </Link>
      <NavLinks />
      <div className="mobile:gap-[clamp(12px,2vw,26px)] ml-auto flex items-center gap-2.5">
        <IconButton aria-label="Search">
          <Icon name="search" />
        </IconButton>
        <AvatarMenu name={user.name} email={user.email} />
        <MobileDrawer />
      </div>
    </header>
  );
}
