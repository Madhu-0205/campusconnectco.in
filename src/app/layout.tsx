import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ToastProvider";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusConnect",
  description: "Professional Student Collaboration & Marketplace Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased`}
      >
        <ToastProvider>
          <SmoothScroll>
            <Navigation />
            <main className="pt-20 min-h-screen pb-10">
              {children}
            </main>
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  );
}
