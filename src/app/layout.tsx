import type { Metadata } from "next"
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google"
import { headers } from "next/headers"
import { Toaster } from "react-hot-toast"

import { GAScripts } from "@/components/Analytics/GoogleAnalytics"
import MainWrapper from "@/components/MainWrapper"
import Navbar from "@/components/navigation/Navbar"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { ToastProvider } from "@/components/ToastProvider"
import FooterWrapper from "@/components/ui/FooterWrapper"
import { ClientOnlyProviders } from "@/components/providers/ClientOnlyProviders"

import "./globals.css"

import { OrganizationSchema, WebSiteSchema, AggregateRatingSchema } from "@/components/seo/JsonLd"

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
})

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.campusconnectco.in"),
  title: {
    default: "CampusConnect — India's Student Super-App",
    template: "%s | CampusConnect",
  },
  description:
    "Find student internships, campus gigs, freelance work, and AI career roadmaps in India. Trusted student opportunities with verified employer hiring.",
  keywords: [
    "student internships",
    "college internships",
    "campus jobs",
    "freelance jobs",
    "AI career roadmap",
    "student networking",
    "career guidance",
    "internships for students",
    "student marketplace",
    "verified student gigs",
  ],
  authors: [{ name: "CampusConnect Team" }],
  creator: "CampusConnect",
  publisher: "CampusConnect",
  alternates: {
    canonical: "https://www.campusconnectco.in/",
    languages: {
      "en-IN": "https://www.campusconnectco.in/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en-IN",
    url: "https://www.campusconnectco.in",
    siteName: "CampusConnect",
    title: "CampusConnect — India's Student Super-App",
    description:
      "Hyperlocal student marketplace. Any college. Any city. Campus gigs, startup internships, AI career roadmap — all in one place.",
    images: [{ url: "/logo-v2.jpg", width: 1200, height: 630, alt: "CampusConnect" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusConnect — India's Student Super-App",
    description:
      "Find students near you for campus gigs, startup internships, and AI career roadmap. Launching across India.",
    images: ["/logo-v2.jpg"],
    site: "@campusconnectin",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "google-site-verification=YOUR_GOOGLE_VERIFICATION_CODE",
    yandex: "yandex=YOUR_YANDEX_VERIFICATION_CODE",
    other: {
      "msvalidate.01": "bing-site-verification=YOUR_BING_VERIFICATION_CODE",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const nonce = (await headers()).get("x-nonce") || undefined

  return (
    <html lang="en" nonce={nonce} data-scroll-behavior="smooth">
      <body
        className={`${bricolage.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased relative`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <GAScripts nonce={nonce} />
        <OrganizationSchema nonce={nonce} />
        <WebSiteSchema nonce={nonce} />
        <AggregateRatingSchema nonce={nonce} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
          <Toaster position="top-right" reverseOrder={false} />
          <ToastProvider>
            <ClientOnlyProviders>
              <Navbar />
              <MainWrapper>{children}</MainWrapper>
              <FooterWrapper />
            </ClientOnlyProviders>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}