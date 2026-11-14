import type { Metadata } from "next"
import Link from "next/link"

import { ContentImage } from "@/components/content/RichBlocks"
import { formatArticleDate, listBlogArticles } from "@/lib/framingworld-content"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog | Framing World",
  description:
    "Framing ideas, gallery wall guides and printing know-how from Framing World, India's custom framing and archival printing studio.",
  alternates: { canonical: "/blogs/news" },
}

const PAGE_SIZE = 12

function pageHref(page: number) {
  return page <= 1 ? "/blogs/news" : `/blogs/news?page=${page}`
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>
}) {
  const query = await searchParams
  const articles = listBlogArticles()
  const pageCount = Math.max(1, Math.ceil(articles.length / PAGE_SIZE))
  const requested = Number.parseInt(Array.isArray(query.page) ? query.page[0] : (query.page ?? "1"), 10)
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), pageCount) : 1
  const visible = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main className="flex-1 bg-white text-black">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
        <header className="mx-auto max-w-[860px] text-center">
          <p className="text-[12px] font-medium uppercase leading-[1.4] tracking-[0.2em] text-brand-cta">Framing World</p>
          <h1 className="type-title mt-4">Blog</h1>
          <p className="mt-4 text-[15px] leading-[1.6] text-ink-600 sm:text-[16px]">
            Framing ideas, gallery wall guides and printing know-how from our New Delhi studio.
          </p>
        </header>

        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-8">
          {visible.map((article, index) => (
            <li key={article.slug}>
              <Link href={`/blogs/news/${article.slug}`} className="group block">
                <div className="hover-zoom relative aspect-[3/2] overflow-hidden bg-brand-cream">
                  {article.image ? (
                    <ContentImage
                      src={article.image}
                      alt={article.title}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="absolute inset-0 h-full object-cover"
                      priority={index < 3}
                    />
                  ) : null}
                </div>
                <p className="mt-4 text-[12px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-ink-600">
                  {formatArticleDate(article)}
                </p>
                <h2 className="mt-2 font-heading text-[20px] leading-[1.3] text-black transition-colors group-hover:text-brand-cta sm:text-[22px]">
                  {article.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-ink-700">{article.excerpt}</p>
                <span className="link-swap mt-4 text-[12px] font-medium uppercase tracking-[0.2em] text-brand-cta" data-underlined>
                  Read more
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {pageCount > 1 ? (
          <nav aria-label="Blog pages" className="mt-16 flex flex-wrap items-center justify-center gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} rel="prev" className="inline-flex h-10 items-center border border-black/20 px-4 text-[13px] uppercase tracking-[0.12em] transition-colors hover:border-black">
                Previous
              </Link>
            ) : null}
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
                aria-current={n === page ? "page" : undefined}
                className={cn(
                  "inline-flex size-10 items-center justify-center border text-[14px] transition-colors",
                  n === page ? "border-black bg-black text-white" : "border-black/20 hover:border-black",
                )}
              >
                {n}
              </Link>
            ))}
            {page < pageCount ? (
              <Link href={pageHref(page + 1)} rel="next" className="inline-flex h-10 items-center border border-black/20 px-4 text-[13px] uppercase tracking-[0.12em] transition-colors hover:border-black">
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </main>
  )
}
