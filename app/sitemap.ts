import type { MetadataRoute } from "next"

import { listBlogArticles, listInfoPages } from "@/lib/framingworld-content"
import { listPublishedCollectionsWithImages, listPublishedProducts } from "@/lib/store/catalog"
import { getSiteUrl } from "@/lib/store/site"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/collections/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/blogs/news`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...listInfoPages()
      .filter((page) => page.slug !== "contact")
      .map((page) => ({
        url: `${siteUrl}/pages/${page.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...listBlogArticles().map((article) => ({
      url: `${siteUrl}/blogs/news/${article.slug}`,
      lastModified: article.publishedAt ? new Date(`${article.publishedAt}T00:00:00Z`) : now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: `${siteUrl}/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/returns-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]

  const [products, collections] = await Promise.all([listPublishedProducts(), listPublishedCollectionsWithImages()])
  return [
    ...staticPages,
    ...collections.map((collection) => ({
      url: `${siteUrl}/collections/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
