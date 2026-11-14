import blogJson from "@/content/framingworld/blog.json"
import faqsJson from "@/content/framingworld/faqs.json"
import imageSizesJson from "@/content/framingworld/image-sizes.json"
import pagesJson from "@/content/framingworld/pages.json"

/**
 * Content taken from framingworld.in (see content/framingworld/README.md):
 * the information pages, the FAQs and the blog. Text uses a small inline
 * syntax: `[label](href)` for links and `**bold**`.
 */
export type ContentBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string }

export type InfoPageSection = { id: string; blocks: ContentBlock[] }

export type InfoPage = {
  slug: string
  title: string
  navLabel: string
  sourceUrl: string
  metaTitle: string
  metaDescription: string
  image: string | null
  sections: InfoPageSection[]
}

export type FaqGroup = {
  title: string
  intro: string
  items: { question: string; answer: string }[]
}

export type BlogArticle = {
  slug: string
  title: string
  sourceUrl: string
  /** ISO date, e.g. "2026-10-26". */
  publishedAt: string | null
  dateLabel: string | null
  author: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  image: string | null
  /** The cover photo is repeated inside the article body. */
  coverInBody: boolean
  blocks: ContentBlock[]
}

const pages = pagesJson as unknown as Record<string, InfoPage>
const articles = blogJson as unknown as BlogArticle[]
const imageSizes = imageSizesJson as unknown as Record<string, [number, number]>

export const faqGroups = faqsJson as unknown as FaqGroup[]

export function getInfoPage(slug: string): InfoPage | null {
  return Object.prototype.hasOwnProperty.call(pages, slug) ? pages[slug] : null
}

export function listInfoPages(): InfoPage[] {
  return Object.values(pages)
}

/** Newest first. */
export function listBlogArticles(): BlogArticle[] {
  return articles
}

export function getBlogArticle(slug: string): BlogArticle | null {
  return articles.find((article) => article.slug === slug) ?? null
}

/** Pixel size of a downloaded image, when known. */
export function imageSize(src: string): { width: number; height: number } | null {
  const size = imageSizes[src]
  return size ? { width: size[0], height: size[1] } : null
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

export function formatArticleDate(article: Pick<BlogArticle, "publishedAt" | "dateLabel">): string {
  if (article.publishedAt) {
    const date = new Date(`${article.publishedAt}T00:00:00Z`)
    if (!Number.isNaN(date.getTime())) return DATE_FORMAT.format(date)
  }
  return article.dateLabel ?? ""
}
