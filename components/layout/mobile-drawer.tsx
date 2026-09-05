"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { IconButton } from "@/components/ui/icon-button";
import { NAV_LINKS } from "@/lib/constants";

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <IconButton
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className="tablet:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        ☰
      </IconButton>

      {open &&
        createPortal(
          <div
            className="bg-scrim-2 animate-fade px-pad mobile:top-[62px] fixed inset-x-0 top-14 bottom-0 z-[39] flex items-start justify-end pt-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <nav
              id="mobile-drawer"
              aria-label="Menu"
              className="border-line-2 bg-bg-2 animate-pop flex w-[min(360px,100%)] origin-top-right flex-col overflow-hidden rounded-xl border shadow-[0_30px_70px_rgba(0,0,0,.6)]"
            >
              <span className="border-line text-mut-2 border-b px-[18px] py-4 font-mono text-mini tracking-[.2em] uppercase">
                Sections
              </span>

              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ animationDelay: `${index * 35}ms` }}
                  className="border-line hover:bg-w-04 hover:text-gold-2 text-fg animate-rise group flex min-h-[62px] w-full items-center gap-3.5 border-b px-[18px] font-mono text-sm tracking-[.08em] uppercase last:border-b-0"
                >
                  <i className="text-mut-2 text-xs not-italic">
                    {String(index + 1).padStart(2, "0")}
                  </i>
                  {link.label}
                  <span className="text-mut-2 group-hover:text-gold-2 ml-auto text-[13px] tracking-[.1em] transition duration-[var(--dur)] ease-cue group-hover:translate-x-1">
                    ⟶
                  </span>
                </Link>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
