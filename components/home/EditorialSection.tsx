import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"
import { bannerFocusProps } from "@/lib/banner-media"
import type { HomeEditorialBanner } from "@/lib/store/banners"

type EditorialPanelProps = {
  src: string
  alt: string
  mobileSrc?: string | null
  href?: string | null
  className?: string
  imageClassName?: string
  /** Crop focus chosen in the admin. */
  focus?: ReturnType<typeof bannerFocusProps>
  sizes?: string
  /** Marks a shoppable photo with a heart in the corner. */
  showHeart?: boolean
}

function EditorialPanel({
  src,
  alt,
  mobileSrc,
  href,
  className,
  imageClassName,
  focus = {},
  sizes = "(max-width: 767px) 100vw, 50vw",
  showHeart = false,
}: EditorialPanelProps) {
  const content = (
    <div data-reveal="zoom" className={cn("hover-zoom relative overflow-hidden rounded-sm bg-white ring-1 ring-black/5", className)}>
      {mobileSrc ? (
        <>
          <div className="relative block sm:hidden w-full h-full">
            <Image
              src={mobileSrc}
              alt={alt}
              fill
              sizes="(max-width: 639px) 100vw, 1px"
              className={cn("object-cover object-center", imageClassName, focus.className)}
              style={focus.style}
            />
          </div>
          <div className="relative hidden sm:block w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 639px) 1px, 50vw"
              className={cn("object-cover object-center", imageClassName, focus.className)}
              style={focus.style}
            />
          </div>
        </>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={cn("object-cover object-center", imageClassName, focus.className)}
              style={focus.style}
        />
      )}
      {showHeart ? (
        <Heart
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 z-10 size-[18px] fill-transparent stroke-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:right-4 sm:top-4 sm:size-5"
          strokeWidth={1.6}
        />
      ) : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    )
  }

  return content
}

export function EditorialSection({
  banners,
}: {
  banners?: HomeEditorialBanner[]
}) {
  const banner0 = banners?.find((b) => b.position === 0) || banners?.[0]
  const banner1 = banners?.find((b) => b.position === 1) || banners?.[1]
  const banner2 = banners?.find((b) => b.position === 2) || banners?.[2]

  const p0Src = banner0?.desktopImageUrl || "/images/catalog/canvas-printing/01.jpg"
  const p0Alt = banner0?.title || "Gallery-wrapped canvas print by Framing World"
  const p0Link = banner0 ? banner0.ctaLink : "/products/canvas-printing"

  const p1Src = banner1?.desktopImageUrl || "/images/catalog/glass-printig/01.jpg"
  const p1Alt = banner1?.title || "Acrylic photo print with a steel stand-off"
  const p1Link = banner1 ? banner1.ctaLink : "/products/glass-printig"

  const p2Src = banner2?.desktopImageUrl || "/images/home/hero-3.webp"
  const bottomFocus = bannerFocusProps(banner2?.desktopFocus, banner2?.mobileFocus)
  const p2MobileSrc = banner2?.mobileImageUrl
  const p2Alt = banner2?.title || "Framed fine art prints arranged on a picture ledge"
  const p2Link = banner2 ? banner2.ctaLink : "/collections/best-selling-frames"

  const bottomPanel = (
    <div data-reveal="zoom" className="hover-zoom relative mt-3 overflow-hidden rounded-sm bg-white ring-1 ring-black/5 aspect-[17/9] md:mt-4 md:aspect-[20/9]">
      {p2MobileSrc ? (
        <>
          <div className="relative block sm:hidden w-full h-full">
            <Image
              src={p2MobileSrc}
              alt={p2Alt}
              fill
              sizes="(max-width: 639px) 100vw, 1px"
              className={cn("object-cover object-[center_44%]", bottomFocus.className)}
              style={bottomFocus.style}
            />
          </div>
          <div className="relative hidden sm:block w-full h-full">
            <Image
              src={p2Src}
              alt={p2Alt}
              fill
              sizes="(min-width: 640px) 100vw, 1px"
              className={cn("object-cover object-[center_44%]", bottomFocus.className)}
              style={bottomFocus.style}
            />
          </div>
        </>
      ) : (
        <Image
          src={p2Src}
          alt={p2Alt}
          fill
          sizes="100vw"
          className={cn("object-cover object-[center_44%]", bottomFocus.className)}
              style={bottomFocus.style}
        />
      )}
    </div>
  )

  return (
    <section className="w-full bg-brand-cream px-3 py-3 text-black sm:px-4 md:px-6 md:py-6">
      <h2 className="sr-only">Prints and frames</h2>

      <div className="reveal-stagger grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <EditorialPanel
          src={p0Src}
          mobileSrc={banner0?.mobileImageUrl}
          alt={p0Alt}
          href={p0Link}
          className="aspect-square w-full"
          imageClassName="object-center"
          focus={bannerFocusProps(banner0?.desktopFocus, banner0?.mobileFocus)}
          showHeart
        />
        <EditorialPanel
          src={p1Src}
          mobileSrc={banner1?.mobileImageUrl}
          alt={p1Alt}
          href={p1Link}
          className="aspect-square w-full"
          imageClassName="object-center"
          focus={bannerFocusProps(banner1?.desktopFocus, banner1?.mobileFocus)}
          showHeart
        />
      </div>

      {p2Link ? (
        <Link href={p2Link} className="block group">
          {bottomPanel}
        </Link>
      ) : (
        bottomPanel
      )}
    </section>
  )
}
