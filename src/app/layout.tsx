import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AI Discovery — Discover AI Tools That Actually Help",
    template: "%s | AI Discovery",
  },
  description:
    "Search, filter, explore, and discover the best AI tools shared by the community. Ratings, reviews, categories, and daily new submissions.",
  keywords: [
    "AI tools",
    "artificial intelligence",
    "machine learning",
    "productivity",
    "writing AI",
    "image generator",
    "code assistant",
    "video AI",
  ],
  authors: [{ name: "AI Discovery Community" }],
  creator: "AI Discovery",
  publisher: "AI Discovery",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "AI Discovery — Community-Powered AI Tool Library",
    description: "Search, filter, explore, and discover AI tools shared by the community.",
    url: baseUrl,
    siteName: "AI Discovery",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Discovery — Discover AI Tools That Actually Help",
    description: "Search, filter, and discover the best AI tools rated by the community.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Discovery",
    url: baseUrl,
    description: "Community-powered AI tool library and discovery directory.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/tools?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${geist.variable} dark h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
