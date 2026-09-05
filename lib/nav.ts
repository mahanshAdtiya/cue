import type { NavLink } from "@/lib/constants";

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isActive(pathname: string, link: NavLink): boolean {
  return [link.href, ...(link.activeOn ?? [])].some((prefix) =>
    matchesPrefix(pathname, prefix),
  );
}
