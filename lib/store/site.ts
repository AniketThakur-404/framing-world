import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"
import { getSiteContent as dalGetSiteContent } from "@/lib/server/dal/site-content"

/**
 * Site-wide copy (menus, footer, contact, policies). Database overrides
 * merged over the code defaults with graceful fallback.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    return await dalGetSiteContent()
  } catch (error) {
    console.error("[site] DB getSiteContent failed, using fallback:", error)
    return DEFAULT_SITE_CONTENT
  }
}

/** Public origin of the storefront, without a trailing slash. */
export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://framingworld.in").replace(/\/$/, "")
}
