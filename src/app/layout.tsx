import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartHydrator } from "@/components/layout/cart-hydrator";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e1613",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <CartHydrator />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <MiniCartDrawer />
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
