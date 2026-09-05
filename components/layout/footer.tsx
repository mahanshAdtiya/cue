import { FOOTER_FLOW, FOOTER_TAGLINE } from "@/lib/constants";

/* Chrome for the (app) group: rendered once in (app)/layout.tsx beside the top
   bar, so it is present on every signed-in route and on none of (public).
   Loader: none — static text, no data. */
export function Footer() {
  return (
    <footer className="border-line px-pad text-mut-2 flex flex-wrap items-center justify-between gap-4 border-t py-[22px] text-[13px]">
      <span>{FOOTER_TAGLINE}</span>
      <span className="mono">{FOOTER_FLOW}</span>
    </footer>
  );
}
