"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/lib/constants";
import { isActive } from "@/lib/nav";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="hidden shrink-0 gap-[clamp(14px,2vw,24px)] whitespace-nowrap tablet:flex"
    >
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`text-sm font-medium transition duration-[var(--dur)] ease-cue ${active ? "text-fg" : "text-mut hover:text-fg"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
