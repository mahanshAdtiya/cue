import type { UserMediaStatus } from "@/lib/db/schema/user-media";

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
  { href: "/home", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/library", label: "My Library", activeOn: ["/title"] },
  { href: "/people", label: "People", activeOn: ["/person"] },
] as const satisfies readonly NavLink[];

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

export const ENTRY_STATUS_LABELS = {
  WANT_TO_WATCH: "Want to watch",
  CURRENTLY_WATCHING: "Watching",
  WATCHED: "Watched",
} as const satisfies Record<UserMediaStatus, string>;

export type ProductStep = {
  num: string;
  title: string;
  body: string;
};

export const PRODUCT_STEPS = [
  {
    num: "01",
    title: "Find it",
    body: "Movies, shows and anime in one search. Wherever you actually watch them. Search movies, shows and anime with ⌘K. Everything starts here.",
  },
  {
    num: "02",
    title: "Track it",
    body: "Want to watch, currently watching, watched — with the season and episode you are on.",
  },
  {
    num: "03",
    title: "Remember it",
    body: "Ratings, favorites, and a shared history with the people you watch with.",
  },
] as const satisfies readonly ProductStep[];

export const FOOTER_TAGLINE =
  "Cue is not where you watch. Cue is where you keep track of what you watch.";
export const FOOTER_FLOW = "Find it → Track it → Watch it → Remember it";

export const TMDB_REVALIDATE_SHORT_S = 60 * 60 * 6;
export const TMDB_REVALIDATE_LONG_S = 60 * 60 * 24 * 7;

export const TMDB_MAX_ATTEMPTS = 3;
export const TMDB_RETRY_BASE_DELAY_MS = 250;
export const TMDB_RETRY_MAX_DELAY_MS = 2000;

export const TMDB_POSTER_SIZE = "w342";
export const TMDB_BACKDROP_SIZE = "w1280";
export const TMDB_ANIME_GENRE_ID = 16;
export const TMDB_ANIME_LANGUAGE = "ja";
export const UNTITLED_MEDIA_TITLE = "Untitled";

export const TMDB_RAIL_SIZE = 14;
export const TMDB_TRENDING_WINDOW = "week";
export const TMDB_SEARCH_ATTEMPTS = 1;
export const TMDB_FIRST_PAGE = 1;
export const TMDB_MAX_PAGE = 500;
