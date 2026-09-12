import type { Metadata } from "next";
import {
  Archivo,
  Bodoni_Moda,
  Caveat,
  Geist_Mono,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";

/**
 * Type system (see app/fonts/README.md).
 *
 *   h1 / important  →  Caesura, ALL CAPS + bold   (licensed; falls back to Bodoni Moda)
 *   h2              →  Peristiva                  (licensed; falls back to Instrument Serif)
 *   everything else →  Archivo + Geist Mono
 *
 * The licensed faces are named first in the stacks in globals.css, so dropping
 * their files in activates them with no code change.
 */

/** Body and UI. A sturdy grotesque that holds up against a high-contrast display face. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Stand-in for Caesura until the licensed file is added. */
const bodoni = Bodoni_Moda({
  variable: "--font-display-fallback",
  subsets: ["latin"],
});

/** Stand-in for Peristiva until the licensed file is added. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-heading-fallback",
  weight: "400",
  subsets: ["latin"],
});

/** Handwriting for the passport signature field. */
const caveat = Caveat({
  variable: "--font-hand",
  weight: "600",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit — find your people in the room",
  description:
    "Orbit turns first-day introductions into student passports and a living classroom constellation, so nobody spends a semester as a stranger.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${geistMono.variable} ${bodoni.variable} ${instrumentSerif.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="orbit-sky min-h-full flex flex-col">{children}</body>
    </html>
  );
}
