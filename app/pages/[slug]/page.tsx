import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { ContentImage, InlineText, RichBlocks } from "@/components/content/RichBlocks"
import { faqGroups, getInfoPage, type ContentBlock, type InfoPage } from "@/lib/framingworld-content"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

/** Shopify-era URLs that now live elsewhere in this site. */
const MOVED: Record<string, string> = {
  contact: "/contact",
  "privacy-policy": "/privacy",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getInfoPage(slug)
  if (!page) return { title: "Page Not Found | Framing World" }

  return {
    title: `${page.metaTitle || page.title} | Framing World`,
    description: page.metaDescription || undefined,
    alternates: { canonical: `/pages/${page.slug}` },
    openGraph: page.image ? { images: [{ url: page.image }] } : undefined,
  }
}

type MediaBlock = Extract<ContentBlock, { type: "image" | "video" }>

function splitSection(blocks: ContentBlock[]) {
  const media = blocks.filter((block): block is MediaBlock => block.type === "image" || block.type === "video")
  const text = blocks.filter((block) => block.type !== "image" && block.type !== "video")
  return { media, text }
}

function Media({ block, priority }: { block: MediaBlock; priority: boolean }) {
  if (block.type === "video") {
    return (
      <video
        src={block.src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black object-cover"
      />
    )
  }
  return (
    <div className="overflow-hidden bg-brand-cream">
      <ContentImage src={block.src} alt={block.alt} sizes="(max-width: 1024px) 100vw, 50vw" priority={priority} />
    </div>
  )
}

function Faqs() {
  return (
    <div className="mx-auto mt-12 w-full max-w-[860px] space-y-14">
      {faqGroups.map((group) => (
        <section key={group.title}>
          <h2 className="font-heading text-[22px] uppercase leading-[1.2] text-black sm:text-[28px]">{group.title}</h2>
          {group.intro ? <p className="mt-2 text-[15px] leading-[1.6] text-ink-600">{group.intro}</p> : null}
          <div className="mt-6 border-t border-black/15">
            {group.items.map((item) => (
              <details key={item.question} className="group border-b border-black/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-medium leading-[1.4] text-black [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="text-[22px] font-light leading-none text-brand-cta transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-6 pr-8 text-[15px] leading-[1.7] text-ink-700">
                  <InlineText text={item.answer} />
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className="bg-brand-cream px-6 py-10 text-center">
        <h2 className="font-heading text-[22px] uppercase leading-[1.2] text-black sm:text-[26px]">Didn&apos;t find your answer?</h2>
        <p className="mt-2 text-[15px] text-ink-600">Don&apos;t hesitate to contact us.</p>
        <Link
          href="/contact"
          className="mt-6 inline-flex h-11 items-center justify-center bg-brand-cta px-8 text-[13px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-terracotta"
        >
          Contact us
        </Link>
      </div>
    </div>
  )
}

function Sections({ page }: { page: InfoPage }) {
  let mediaRows = 0

  return (
    <div className="mt-10 space-y-14 lg:mt-14 lg:space-y-20">
      {page.sections.map((section, index) => {
        const { media, text } = splitSection(section.blocks)

        // Photos only: a simple grid.
        if (text.length === 0) {
          return (
            <section key={section.id} className={cn("grid gap-3 sm:gap-4", media.length > 1 ? "sm:grid-cols-2" : "", media.length > 2 ? "lg:grid-cols-3" : "")}>
              {media.map((block) => (
                <Media key={block.src} block={block} priority={index === 0} />
              ))}
            </section>
          )
        }

        // Text only: one readable column.
        if (media.length === 0) {
          return (
            <section key={section.id} className="mx-auto w-full max-w-[860px]">
              <RichBlocks blocks={text} uppercaseHeadings />
            </section>
          )
        }

        // Photo(s) beside text, alternating sides down the page.
        const mediaFirst = mediaRows++ % 2 === 0
        return (
          <section key={section.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className={cn("grid gap-3", media.length > 1 ? "grid-cols-2" : "", mediaFirst ? "" : "lg:order-2")}>
              {media.map((block) => (
                <Media key={block.src} block={block} priority={index === 0} />
              ))}
            </div>
            <RichBlocks blocks={text} uppercaseHeadings />
          </section>
        )
      })}
    </div>
  )
}

export default async function InfoPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (MOVED[slug]) redirect(MOVED[slug])

  const page = getInfoPage(slug)
  if (!page) notFound()

  return (
    <main className="flex-1 bg-white text-black">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
        <header className="mx-auto max-w-[860px] text-center">
          <p className="text-[12px] font-medium uppercase leading-[1.4] tracking-[0.2em] text-brand-cta">Framing World</p>
          <h1 className="type-title mt-4">{page.title}</h1>
          {page.slug === "faqs" ? (
            <p className="mt-4 text-[15px] leading-[1.6] text-ink-600 sm:text-[16px]">
              Find answers to common questions about framing and enhance your knowledge.
            </p>
          ) : null}
        </header>

        {page.slug === "faqs" ? <Faqs /> : <Sections page={page} />}
      </div>
    </main>
  )
}
