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
