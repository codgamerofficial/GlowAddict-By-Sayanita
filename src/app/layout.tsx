import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeInit } from "@/components/ThemeInit";

export const metadata: Metadata = {
  title: "Glow Addict by Sayanita | 100% Authentic Premium Skincare",
  description: "Indulge in 100% genuine, premium skincare brands like COSRX, The Ordinary, CeraVe, and Laneige. Authentic self-care celebrating your journey at prices within reach.",
  keywords: "skincare, authentic skincare, COSRX, The Ordinary, CeraVe, Laneige, Glow Addict, Sayanita, Indian skincare, beauty",
  authors: [{ name: "Sayanita Payra" }],
  openGraph: {
    title: "Glow Addict by Sayanita | 100% Authentic Premium Skincare",
    description: "Indulge in 100% genuine, premium skincare at prices within reach.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head />
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased pb-20 md:pb-0">
        <ShopProvider>
          <ThemeInit />
          {children}
          <MobileBottomNav />
        </ShopProvider>
      </body>
    </html>
  );
}

