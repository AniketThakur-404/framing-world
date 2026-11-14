import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

/**
 * Site-wide copy (menus, footer, contact, policies). It lives in
 * lib/site-content.ts; there is no database or admin to override it.
 */
export async function getSiteContent(): Promise<SiteContent> {
  return DEFAULT_SITE_CONTENT
}

/** Public origin of the storefront, without a trailing slash. */
export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://framingworld.in").replace(/\/$/, "")
}
