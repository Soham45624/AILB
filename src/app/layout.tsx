import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import { Suspense } from "react";
import { NavigationProgressBar } from "@/components/ui/NavigationProgressBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { InactivityListener } from "@/components/auth/InactivityListener";
import "./globals.css";
import { baseUrl } from "@/lib/config";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AILIB — Discover the right AI for what you build",
    template: "%s | AILIB",
  },
  description:
    "Explore AI tools or tell AILIB what you're trying to accomplish. Independent directory of community-tested, verified AI applications.",
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
  authors: [{ name: "AILIB Community" }],
  creator: "AILIB",
  publisher: "AILIB",
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
    title: "AILIB — Discover the right AI for what you build",
    description: "Explore AI tools or tell AILIB what you're trying to accomplish.",
    url: baseUrl,
    siteName: "AILIB",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AILIB — Discover the right AI for what you build",
    description: "Explore AI tools or tell AILIB what you're trying to accomplish.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AILIB",
    url: baseUrl,
    description: "Discover the right AI for what you build.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/tools?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FBF9F5] text-[#141613]">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <InactivityListener />
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
