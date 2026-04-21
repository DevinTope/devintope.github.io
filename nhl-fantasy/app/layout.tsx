import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NHL Fantasy League",
  description: "Fantasy league leaderboard and admin tools for managing teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-950">
              NHL Fantasy
            </Link>
            <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <Link
                href="/"
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Leaderboard
              </Link>
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
