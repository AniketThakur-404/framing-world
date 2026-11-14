import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { preload } from "react-dom";
import { FONT_PRELOADS } from "@/lib/fonts";
import { SiteChrome } from "@/components/SiteChrome";
import { Toaster } from "@/components/ui/sonner";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartProvider } from "@/lib/cart-context";
import { RevealObserver } from "@/components/RevealObserver";
import { SmoothMotion } from "@/components/SmoothMotion";
import { SiteContentProvider } from "@/lib/site-content-context";
import { getSiteContent } from "@/lib/store/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://framingworld.in"),
  title: "Framing World | Custom Photo Frames & Archival Printing",
  description:
    "Order custom photo frames online from Delhi's leading photo frame shop. Explore wall photo frames, acrylic photo prints & handmade frames. Easy online frame maker with fast delivery.",
  applicationName: "Framing World",
  keywords: [
    "Framing World",
    "Custom Photo Frames",
    "Photo Frame Shop Delhi",
    "Custom Framing",
    "Archival Printing",
    "Fine Art Prints",
    "Wall Photo Frames",
    "Acrylic Photo Prints",
    "Frame Mouldings",
  ],
  authors: [{ name: "Framing World" }],
  creator: "Framing World",
  publisher: "Framing World",
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
  openGraph: {
    title: "Buy Custom Photo Frames Online | Framing World",
    description:
      "India's premium destination for custom framing, archival printing, and museum-grade preservation.",
    url: "https://framingworld.in",
    siteName: "Framing World",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/brand/og-image.jpg", width: 1200, height: 628, alt: "Framing World" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Custom Photo Frames Online | Framing World",
    description:
      "India's premium destination for custom framing, archival printing, and museum-grade preservation.",
    images: ["/brand/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await getSiteContent();
  for (const href of FONT_PRELOADS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans"
      )}
    >
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to
          <body> before React loads; ignore those attribute mismatches on this tag only. */}
      <body className="min-h-full flex flex-col bg-white text-foreground" suppressHydrationWarning>
        <Toaster position="bottom-right" />
        <RevealObserver />
        <SmoothMotion />
        <div className="relative flex flex-1 flex-col overflow-x-clip">
          <SiteContentProvider content={siteContent}>
          <CartProvider>
          <WishlistProvider>
            <SiteChrome>{children}</SiteChrome>
          </WishlistProvider>
          </CartProvider>
          </SiteContentProvider>
        </div>
      </body>
    </html>
  );
}
