import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";

import { Splash } from "@/components/layout/splash";

import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Cue — keep track of what you watch",
    template: "%s · Cue",
  },
  description:
    "Cue is not where you watch. Cue is where you keep track of what you watch — the movies, shows and anime you want to watch, are watching, and have watched.",
  applicationName: "Cue",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <body>
        {children}
        <Splash />
      </body>
    </html>
  );
}
