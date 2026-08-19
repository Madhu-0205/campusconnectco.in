import type { Metadata } from "next"
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google"
import { headers } from "next/headers"
import { Toaster } from "react-hot-toast"

import { GAScripts } from "@/components/Analytics/GoogleAnalytics"
import MainWrapper from "@/components/MainWrapper"
import Navbar from "@/components/navigation/Navbar"
import { ClientOnlyProviders } from "@/components/providers/ClientOnlyProviders"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { OrganizationSchema, WebSiteSchema, AggregateRatingSchema } from "@/components/seo/JsonLd"
import { ToastProvider } from "@/components/ToastProvider"
import FooterWrapper from "@/components/ui/FooterWrapper"
import { CommandCenter } from "@/components/v2/CommandCenter"

import "./globals.css"


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
  ...(process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? {
    verification: {
      google: (process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION)!,
      ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
      ...(process.env.BING_SITE_VERIFICATION ? {
        other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION },
      } : {}),
    },
  } : {}),
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${bricolage.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#050508] text-white selection:bg-[#7c3aed]/30 selection:text-white relative`}>
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
              <CommandCenter />
            </ClientOnlyProviders>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}