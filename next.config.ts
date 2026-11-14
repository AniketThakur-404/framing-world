import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // Banners saved in admin may still point at the old "/products" listing.
      { source: "/products", destination: "/shop", permanent: false },
      // URLs from the previous Shopify storefront.
      { source: "/collections/all", destination: "/shop", permanent: true },
      { source: "/policies/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/blogs", destination: "/blogs/news", permanent: true },
      { source: "/account/login", destination: "/login", permanent: true },
      { source: "/account/register", destination: "/signin", permanent: true },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
