import type { MediaType } from "@/lib/db/schema/media";
import type { IconName } from "@/lib/icons";
import type { UserMediaStatus } from "@/lib/db/schema/user-media";

export const SESSION_TOKEN_BYTES = 32;
export const SESSION_COOKIE_NAME = "cue_session";
export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

export const SIGNED_IN_TOAST = {
  kind: "success",
  label: "Signed in",
  message: "Welcome back.",
} as const;

export const SIGNED_OUT_TOAST = {
  kind: "info",
  label: "Signed out",
  message: "You are signed out of Cue.",
} as const;

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

export type ToastKind = "success" | "error" | "info";

export const TOAST_KINDS = {
  success: { icon: "check", label: "Done" },
  error: { icon: "close", label: "Problem" },
  info: { icon: "info", label: "Heads up" },
} as const satisfies Record<ToastKind, { icon: IconName; label: string }>;

export const TOAST_MAX = 4;
export const TOAST_DURATION_MS = 4200;
export const TOAST_EXIT_MS = 220;
export const EMPTY_TOASTS: never[] = [];

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

export const TMDB_MAX_ATTEMPTS = 4;
export const TMDB_RETRY_BASE_DELAY_MS = 250;
export const TMDB_RETRY_MAX_DELAY_MS = 2000;
export const TMDB_RETRY_JITTER = 0.5;
export const TMDB_CONCURRENCY = 3;

export const TMDB_POSTER_SIZE = "w342";
export const TMDB_BACKDROP_SIZE = "w1280";
export const TMDB_BACKDROP_CARD_SIZE = "w780";
export const TMDB_ANIME_GENRE_ID = 16;
export const TMDB_ANIME_LANGUAGE = "ja";
export const UNTITLED_MEDIA_TITLE = "Untitled";

export const TMDB_RAIL_SIZE = 14;
export const TMDB_TRENDING_WINDOW = "week";
export const TMDB_SEARCH_ATTEMPTS = 1;
export const TMDB_FIRST_PAGE = 1;
export const TMDB_MAX_PAGE = 500;

export const MEDIA_HUE_STEPS = 360;
export const MEDIA_HUE_SEED = 31;
export const MEDIA_SEPARATOR = " \u00b7 ";
export const MEDIA_RATING_GLYPH = "\u2605";
export const MEDIA_RATING_DECIMALS = 1;

export const MEDIA_CARD_SIZES = "(max-width: 45rem) 33vw, 150px";
export const HOVER_CARD_SIZES = "(max-width: 45rem) 90vw, 460px";

export const HOVER_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const HOVER_OPEN_DELAY_MS = 150;
export const HOVER_CLOSE_DELAY_MS = 240;
export const HOVER_TRANSITION_MS = 460;
export const HOVER_FADE_MS = 260;
export const HOVER_FADE_DELAY_MS = 90;
export const HOVER_CARD_SCALE = 2.6;
export const HOVER_CARD_MIN_WIDTH = 420;
export const HOVER_CARD_ART_RATIO = 9 / 16;
export const HOVER_CARD_BODY_H = 196;
export const HOVER_CARD_MARGIN = 12;
export const HOVER_TAIL_MAX = 128;
export const HOVER_TAIL_ELLIPSIS = "\u2026";

export const MEDIA_ROW_SEE_ALL = "See all";
export const MEDIA_ROW_EMPTY = "Nothing here yet.";
export const MEDIA_ROW_PRIORITY_COUNT = 5;
export const MEDIA_ROW_LIMIT = 10;
export const MEDIA_ROW_SKELETON_SLOTS = 7;

export const RAIL_PAGE_RATIO = 0.9;
export const RAIL_EDGE_EPSILON = 2;
export const RAIL_PREV_LABEL = "Scroll left";
export const RAIL_NEXT_LABEL = "Scroll right";

export const HOVER_CARD_OPEN_LABEL = "Open";
export const HOVER_STATE_UNTRACKED = "Not tracked yet";

export type MediaAction = {
  key: "want" | "watched" | "favorite";
  icon: IconName;
  label: string;
};

export const MEDIA_ACTIONS = [
  { key: "want", icon: "plus", label: "Want to watch" },
  { key: "watched", icon: "check", label: "Mark as watched" },
  { key: "favorite", icon: "star", label: "Add to favorites" },
] as const satisfies readonly MediaAction[];

export const MEDIA_ACTION_PENDING = {
  kind: "info",
  label: "Not wired up yet",
  message: "Tracking lands once the user-media server actions exist.",
} as const;

export const MEDIA_RANK_PAD = 2;
export const MEDIA_EXTENT_FEATURE = "Feature";
export const MEDIA_SEASON_UNIT = ["season", "seasons"] as const;
export const MEDIA_EPISODE_UNIT = ["episode", "episodes"] as const;
export const MEDIA_SEASON_CODE = "S";
export const MEDIA_EPISODE_CODE = "E";

export const MEDIA_KIND_LABELS = {
  MOVIE: "Movie",
  TV_SHOW: "TV Show",
  ANIME: "Anime",
} as const satisfies Record<MediaType | "ANIME", string>;

export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_DAYS = 7;
export const ISO_WEEK_THURSDAY = 4;
export const RELATIVE_DAY_TODAY = "today";
export const RELATIVE_DAY_TOMORROW = "tomorrow";
export const RELATIVE_DAY_FUTURE = "in {n} days";
export const RELATIVE_DAY_COUNT_TOKEN = "{n}";

export const TMDB_UPCOMING_CANDIDATES = 8;

export const EXPLORE_RAIL_SIZE = 12;
export const EXPLORE_MARQUEE_SIZE = 5;
export const EXPLORE_UPCOMING_SIZE = 4;

export const EXPLORE_MARQUEE_HOLD_MS = 7000;
export const EXPLORE_MARQUEE_SWAP_MS = 340;
export const EXPLORE_MARQUEE_EYEBROW = "The marquee";
export const EXPLORE_MARQUEE_WEEK = "week";
export const EXPLORE_MARQUEE_INDEX_HEAD = "Five to consider · hover to hold";
export const EXPLORE_MARQUEE_TRACK = "Add to library";
export const EXPLORE_MARQUEE_OPEN = "Open title";

export const EXPLORE_NOTE =
  "Explore is for finding something to log. Nothing here is personalised — it is what is busy this week and what has held up over time.";

export type ExploreFilter = "all" | "shows" | "movies" | "anime";

export const EXPLORE_FILTER_PARAM = "type";
export const EXPLORE_FILTER_DEFAULT = "all" satisfies ExploreFilter;

export const EXPLORE_FILTERS = [
  { key: "all", label: "Everything" },
  { key: "shows", label: "Shows" },
  { key: "movies", label: "Movies" },
  { key: "anime", label: "Anime" },
] as const satisfies readonly { key: ExploreFilter; label: string }[];

export const EXPLORE_COUNT_LABEL = "titles";

export const EXPLORE_TRENDING_TITLE = "Trending this week";
export const EXPLORE_TRENDING_NOTE = "what everyone is watching";
export const EXPLORE_TOP_TITLE = "Great by consensus";
export const EXPLORE_TOP_NOTE = "highest rated, all time";
export const EXPLORE_TOP_COUNTER = "TOP";
export const EXPLORE_UPCOMING_TITLE = "New seasons landing";
export const EXPLORE_UPCOMING_NOTE = "episodes out in the next fortnight";
export const EXPLORE_UPCOMING_EMPTY = "Nothing airing in the next fortnight.";
export const EXPLORE_UPCOMING_TRACK = "Track";
export const EXPLORE_UPCOMING_SIZES = "36px";

export const EXPLORE_MARQUEE_SKELETON_ROWS = 5;
export const EXPLORE_UPCOMING_FORTNIGHT_DAYS = 14;
export const EXPLORE_SECTION_ERROR =
  "Could not load this section. It will be back on the next refresh.";
export const EXPLORE_TRENDING_HREF = "/explore/trending";
export const EXPLORE_TOP_HREF = "/explore/top-rated";
export const EXPLORE_UPCOMING_HREF = "/explore/upcoming";
export const TMDB_MIN_VOTES = 2000;
export const TMDB_SORT_RATING = "vote_average.desc";
export const TMDB_SORT_POPULARITY = "popularity.desc";
export const ISO_DATE_LENGTH = 10;
export const EXPLORE_SCOPE_SELECTOR = "[data-explore-scope]";
