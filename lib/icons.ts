export const ICON_VIEWBOX = "0 0 24 24";
export const ICON_SIZE = 18;
export const ICON_STROKE = 1.5;

export const ICON_PATHS = {
  "arrow-right": "M5 12h13M13 6l6 6-6 6",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14ZM20.5 20.5 16 16",
  menu: "M4 7h16M4 12h16M4 17h16",
  "chevron-left": "M15 5 8 12l7 7",
  "chevron-right": "M9 5l7 7-7 7",
  check: "M5 12.5 9.5 17 19 7",
  close: "M6 6l12 12M18 6 6 18",
  info: "M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20ZM12 16.5V11M12 7.6h.01",
  plus: "M12 5v14M5 12h14",
  star: "M12 3 14.2 9 20.6 9.2 15.5 13.1 17.3 19.3 12 15.7 6.7 19.3 8.5 13.1 3.4 9.2 9.8 9Z",
} as const;

export type IconName = keyof typeof ICON_PATHS;
