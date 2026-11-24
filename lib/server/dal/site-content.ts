import "server-only"

import { cache } from "react"

import { getPrisma } from "@/lib/server/db"
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_KEYS,
  type SiteContent,
  type SiteContentKey,
} from "@/lib/site-content"
import { siteContentSchemas } from "@/lib/validations/site-content"

function parseStored<K extends SiteContentKey>(key: K, value: unknown): SiteContent[K] | null {
  const schema = siteContentSchemas[key]
  const result = schema.safeParse(value)
  return result.success ? (result.data as SiteContent[K]) : null
}

/**
 * Storefront content: database overrides merged over the code defaults. One
 * query per request thanks to React's cache; a database outage falls back to
 * the defaults so the storefront never breaks because of the CMS.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const content: SiteContent = structuredClone(DEFAULT_SITE_CONTENT)

  try {
    const rows = await getPrisma().siteContent.findMany({
      select: { key: true, value: true },
    })
    for (const row of rows) {
      if (!(SITE_CONTENT_KEYS as string[]).includes(row.key)) continue
      const key = row.key as SiteContentKey
      const parsed = parseStored(key, row.value)
      if (parsed) {
        ;(content as Record<string, unknown>)[key] = parsed
      }
    }
  } catch (error) {
    console.error("[site-content] falling back to defaults", error)
  }

  return content
})
