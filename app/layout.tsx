import type { Metadata } from "next";
import {
  Archivo_Black,
  Caveat,
  Geist,
  Geist_Mono,
  Rubik_Spray_Paint,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Passport display type — heavy poster sans for stamped headline fields. */
const archivoBlack = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

/** The sprayed wordmark on the passport, mirroring a hand-tagged ID card. */
const rubikSpray = Rubik_Spray_Paint({
  variable: "--font-spray",
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
      className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} ${rubikSpray.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="orbit-sky min-h-full flex flex-col">{children}</body>
    </html>
  );
}
