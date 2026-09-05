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

export const TOP_BAR_SKELETON = {
  nav: { h: 13, w: { "/": 40, "/library": 72, "/people": 46 } },
  icon: { w: 42, h: 36 },
  avatar: 32,
} as const;

export const ROUTE_LOAD_DELAY_MS = 90;
export const ROUTE_LOAD_MINIMUM_MS = 420;
export const ROUTE_LOAD_EXIT_MS = 220;

export const NOT_FOUND_STRIP = {
  slots: 8,
  missingIndex: 2,
  riseDelayMs: 260,
  riseStepMs: 30,
} as const;

export const SPLASH_WORD = "Cue";
export const SPLASH_TAGLINE = "Keep track of what you watch";
export const SPLASH_STEPS = [
  "Warming up",
  "Loading catalogue",
  "Restoring your library",
  "Ready",
] as const;
export const SPLASH_MINIMUM_MS = 1100;
export const SPLASH_SETTLE_MS = 360;
export const SPLASH_LIFT_MS = 620;
