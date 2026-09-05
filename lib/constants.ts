export const SESSION_TOKEN_BYTES = 32;
export const SESSION_COOKIE_NAME = "cue_session";
export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

export type NavLink = {
  href: string;
  label: string;
  activeOn?: readonly string[];
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/library", label: "My Library", activeOn: ["/title"] },
  { href: "/people", label: "People", activeOn: ["/person"] },
] as const satisfies readonly NavLink[];

/* Skeleton geometry for <TopBarSessionFallback>, measured off the real controls:
   IconButton is px-3 py-[9px] + 1px border around 16px/leading-none text, Avatar
   is size-8. Nav blocks are 13px tall rather than the 20px text line box — the
   36px icon button sets the row height, so the shorter block reads like text
   without shifting anything. */
export const TOP_BAR_SKELETON = {
  nav: { h: 13, w: { "/": 40, "/library": 72, "/people": 46 } },
  icon: { w: 42, h: 36 },
  avatar: 32,
} as const;

/* RouteLoad timing (route-loader.js:16). Together: say nothing for the first
   90ms, and if you do say something, stay up 420ms so it cannot strobe. */
export const ROUTE_LOAD_DELAY_MS = 90;
export const ROUTE_LOAD_MINIMUM_MS = 420;
export const ROUTE_LOAD_EXIT_MS = 220;

/* The 404 poster strip. Eight slots with the third dashed out — the gap is the
   whole illustration, so both numbers are fixed here rather than derived from
   any real list. Slots rise in sequence once the copy above them has landed. */
export const NOT_FOUND_STRIP = {
  slots: 8,
  missingIndex: 2,
  riseDelayMs: 260,
  riseStepMs: 30,
} as const;
