import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-header",
  weight: ["600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Train Board",
  description: "Digital split-flap household calendar display prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
