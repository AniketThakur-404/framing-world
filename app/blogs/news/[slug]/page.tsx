import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ContentImage, RichBlocks } from "@/components/content/RichBlocks"
import { formatArticleDate, getBlogArticle, listBlogArticles } from "@/lib/framingworld-content"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) return { title: "Article Not Found | Framing World" }

  return {
    title: `${article.metaTitle || article.title} | Framing World`,
    description: article.metaDescription || article.excerpt,
    alternates: { canonical: `/blogs/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.metaDescription || article.excerpt,
      publishedTime: article.publishedAt ?? undefined,
      images: article.image ? [{ url: article.image }] : undefined,
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const all = listBlogArticles()
  const position = all.findIndex((item) => item.slug === article.slug)
  // The three next-older articles (wrapping round at the end of the list).
  const more = [1, 2, 3].map((offset) => all[(position + offset) % all.length]).filter((item) => item.slug !== article.slug)

  return (
    <main className="flex-1 bg-white text-black">
      <article className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-16">
        <nav aria-label="Breadcrumb" className="text-[12px] uppercase tracking-[0.12em] text-ink-600">
          <Link href="/" className="transition-colors hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blogs/news" className="transition-colors hover:text-black">Blog</Link>
        </nav>

        <h1 className="mt-6 font-heading text-[28px] leading-[1.2] text-black sm:text-[40px]">{article.title}</h1>
        <p className="mt-4 text-[13px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-ink-600">
          {formatArticleDate(article)} · {article.author}
        </p>

        {article.image && !article.coverInBody ? (
          <div className="mt-8 overflow-hidden bg-brand-cream">
            <ContentImage src={article.image} alt={article.title} sizes="(max-width: 900px) 100vw, 860px" priority />
          </div>
        ) : null}

        <RichBlocks blocks={article.blocks} className="mt-8" imageSizes="(max-width: 900px) 100vw, 860px" />
      </article>

      {more.length > 0 ? (
        <section className="border-t border-black/15 bg-brand-cream">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <h2 className="type-title text-center">You may also like</h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {more.map((item) => (
                <li key={item.slug}>
                  <Link href={`/blogs/news/${item.slug}`} className="group block">
                    <div className="hover-zoom relative aspect-[3/2] overflow-hidden bg-white">
                      {item.image ? (
                        <ContentImage
                          src={item.image}
                          alt={item.title}
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="absolute inset-0 h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <p className="mt-4 text-[12px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-ink-600">
                      {formatArticleDate(item)}
                    </p>
                    <h3 className="mt-2 font-heading text-[19px] leading-[1.3] text-black transition-colors group-hover:text-brand-cta">
                      {item.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  )
}
