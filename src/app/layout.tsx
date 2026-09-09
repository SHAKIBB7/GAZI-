import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cricket Store Pro | Enterprise Multi-Vendor Cricket Gear & Knocking Hub",
  description: "Bangladesh's premier cricket store for English Willow Bats, Match Balls, Protective Gear, Knocking-in Services, and Custom Team Kits.",
  keywords: "Cricket Bats, English Willow, Kookaburra, Gray-Nicolls, SS, CA, SG, MRF, Knocking Service, bKash, SSLCommerz, Cricket Bangladesh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900">
        <TopBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
