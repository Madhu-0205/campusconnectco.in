import type { Metadata } from "next"
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google"
import Navbar from "@/components/navigation/Navbar"
import { ToastProvider } from "@/components/ToastProvider"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import AIServiceAgent from "@/components/AIServiceAgent"
import { GlobalBackground } from "@/components/GlobalBackground"
import MainWrapper from "@/components/MainWrapper"
import SmoothScrollProvider from "@/components/ui/SmoothScroll"
import CustomCursor from "@/components/ui/CustomCursor"
import FooterWrapper from "@/components/ui/FooterWrapper"
import "./globals.css"
import { headers } from "next/headers"
import { OrganizationSchema, WebSiteSchema, AggregateRatingSchema } from "@/components/seo/JsonLd"
import NetworkStatusIndicator from "@/components/NetworkStatusIndicator"
import { GAScripts } from "@/components/Analytics/GoogleAnalytics"

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
  preload: false,
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
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
    "Find students near you for campus gigs, startup internships, and AI career roadmap. Any college, any city across India. Secure escrow payments, no hidden fees.",
  keywords: [
    "student gigs india",
    "campus internships",
    "hire student near me",
    "student marketplace india",
    "campus connect",
    "earn money college student india",
    "hyperlocal student platform",
    "student freelance india",
    "startup internship india",
    "ai career roadmap student",
  ],
  authors: [{ name: "CampusConnect Team" }],
  creator: "CampusConnect",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://campusconnectco.in",
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
  },
  icons: {
    icon: "/favicon.ico",
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
    <html lang="en" suppressHydrationWarning nonce={nonce} data-scroll-behavior="smooth">
      <body
        className={`${bricolage.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased relative`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <GAScripts nonce={nonce} />
        <OrganizationSchema nonce={nonce} />
        <WebSiteSchema nonce={nonce} />
        <AggregateRatingSchema nonce={nonce} />
        <CustomCursor />
        <GlobalBackground />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
          <Toaster position="top-right" reverseOrder={false} />
          <ToastProvider>
            <SmoothScrollProvider>
              <Navbar />
              <MainWrapper>{children}</MainWrapper>
              <FooterWrapper />
            </SmoothScrollProvider>
          </ToastProvider>
          <AIServiceAgent />
          <NetworkStatusIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}