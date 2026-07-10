import { Fraunces, Hanken_Grotesk } from "next/font/google";

/** Display serif — elegant, editorial, luxurious. */
export const fontSerif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

/** Body sans — modern, highly legible, calm. */
export const fontSans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
