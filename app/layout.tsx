import type { Metadata } from "next";
import { Anton, Funnel_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Moon or Doom",
  description: "Guess BTC price movements!",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className={clsx(
        funnelSans.variable,
        geistMono.variable,
        anton.variable,
        "h-full antialiased",
      )}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
