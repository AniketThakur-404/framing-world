import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { imageSize, type ContentBlock } from "@/lib/framingworld-content"
import { cn } from "@/lib/utils"

const INLINE_PATTERN = /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)\s]+)\)$/

const LINK_CLASS = "text-brand-cta underline underline-offset-2 transition-colors hover:text-black"

function renderBold(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${keyPrefix}-b${index}`} className="font-semibold text-black">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  )
}

/** Inline text with `[label](href)` links and `**bold**`. */
export function InlineText({ text }: { text: string }) {
  const parts = text.split(INLINE_PATTERN)
  return (
    <>
      {parts.map((part, index) => {
        const link = LINK_PATTERN.exec(part)
        if (!link) return renderBold(part, `t${index}`)
        const [, label, href] = link
        const children = renderBold(label, `l${index}`)
        if (href.startsWith("/") && !href.startsWith("//")) {
          return (
            <Link key={index} href={href} className={LINK_CLASS}>
              {children}
            </Link>
          )
        }
        const external = /^https?:\/\//.test(href)
        if (!external && !href.startsWith("mailto:") && !href.startsWith("tel:")) return children
        return (
          <a
            key={index}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={LINK_CLASS}
          >
            {children}
          </a>
        )
      })}
    </>
  )
}

export function ContentImage({
  src,
  alt,
  sizes = "(max-width: 1024px) 100vw, 800px",
  className,
  priority = false,
}: {
  src: string
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
}) {
  const size = imageSize(src)
  if (!size) {
    // Size unknown: plain image so nothing is cropped or distorted.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={cn("h-auto w-full", className)} />
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      sizes={sizes}
      priority={priority}
      className={cn("h-auto w-full", className)}
    />
  )
}

const HEADING_CLASS: Record<number, string> = {
  1: "font-heading text-[26px] leading-[1.2] sm:text-[32px]",
  2: "font-heading text-[24px] leading-[1.2] sm:text-[30px]",
  3: "font-heading text-[20px] leading-[1.25] sm:text-[24px]",
  4: "font-heading text-[18px] leading-[1.3] sm:text-[20px]",
  5: "text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.12em]",
  6: "text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.12em]",
}

/**
 * Renders extracted page / article content. `uppercaseHeadings` matches the
 * section headings of the information pages; articles keep sentence case.
 */
export function RichBlocks({
  blocks,
  uppercaseHeadings = false,
  className,
  imageSizes,
}: {
  blocks: ContentBlock[]
  uppercaseHeadings?: boolean
  className?: string
  /** `sizes` attribute for images inside the content column. */
  imageSizes?: string
}) {
  return (
    <div className={cn("space-y-5 text-[15px] leading-[1.7] text-ink-700 sm:text-[16px]", className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const level = Math.min(Math.max(block.level, 2), 6)
            const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6"
            return (
              <Tag
                key={index}
                className={cn(
                  "pt-3 text-black first:pt-0",
                  HEADING_CLASS[block.level] ?? HEADING_CLASS[3],
                  uppercaseHeadings && block.level <= 4 && "uppercase",
                )}
              >
                {block.text}
              </Tag>
            )
          }
          case "paragraph":
            return (
              <p key={index}>
                <InlineText text={block.text} />
              </p>
            )
          case "list":
            return (
              <ul key={index} className="list-disc space-y-2 pl-5 marker:text-brand-cta">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ul>
            )
          case "image":
            return (
              <figure key={index} className="overflow-hidden bg-brand-cream">
                <ContentImage src={block.src} alt={block.alt} sizes={imageSizes} />
              </figure>
            )
          case "video":
            return (
              <video key={index} src={block.src} controls playsInline preload="metadata" className="aspect-video w-full bg-black" />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
