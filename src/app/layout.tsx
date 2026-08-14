import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Discovery — Discover AI Tools That Actually Help",
    template: "%s | AI Discovery",
  },
  description:
    "Search, filter, explore, and discover the best AI tools shared by the community. Ratings, reviews, categories, and daily new submissions.",
  keywords: ["AI tools", "artificial intelligence", "machine learning", "productivity", "writing AI", "image generation", "code assistant"],
  openGraph: {
    title: "AI Discovery — Community-Powered AI Tool Library",
    description: "Find the best AI tools rated and reviewed by the community.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
