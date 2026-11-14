"use client"

import Image from "next/image"
import Link from "next/link"

import { useContinuousDraggableCarousel } from "./useContinuousDraggableCarousel"
import { bannerFocusProps } from "@/lib/banner-media"
import type { HomeCarouselSlide } from "@/lib/store/banners"
import { cn } from "@/lib/utils"

type CategoryTile = {
  id: string
  image: string
  alt: string
  label: string
  href: string
  desktopFocus?: string | null
  mobileFocus?: string | null
}

/** Shown until the carousel slides are set in Dashboard → Banners. */
const DEFAULT_TILES: CategoryTile[] = [
  { id: "default-wall-gallery", image: "/images/home/tile-frame-wall-gallery.jpg", alt: "Gallery wall of black frames with family photographs", label: "Wall Gallery", href: "/collections/wall-gallery" },
  { id: "default-wooden-frames", image: "/images/home/hero-2.webp", alt: "Three framed landscape prints above a sofa", label: "Imported Wooden Frames", href: "/collections/imported-wooden-frames" },
  { id: "default-fine-art-prints", image: "/images/home/home-consultation.jpg", alt: "Canvas print hung above an artist's bench", label: "Fine Art Prints", href: "/collections/fine-art-prints" },
  { id: "default-digital-fine-art", image: "/images/home/hero-3.webp", alt: "Framed fine art prints arranged on a picture ledge", label: "Digital Fine Art", href: "/collections/best-selling-frames" },
  { id: "default-mouldings", image: "/images/home/hero-1.jpg", alt: "Wall of frame moulding samples at the Framing World studio", label: "Mouldings", href: "/collections/molding" },
]

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

function toTile(slide: HomeCarouselSlide): CategoryTile {
  // The slide name (subtitle) is the label; the title is the image description.
  const label = slide.subtitle?.trim() || slide.title?.trim() || "Shop"
  const link = slide.ctaLink?.trim()
  return {
    id: slide.id,
    image: slide.desktopImageUrl,
    alt: slide.title || `${label} collection`,
    label,
    desktopFocus: slide.desktopFocus,
    mobileFocus: slide.mobileFocus,
    // A bare "/collections" link is the old seed default; prefer the collection page.
    href: link && link !== "/collections" ? link : `/collections/${slugify(label)}`,
  }
}

function TileCard({ tile, hidden }: { tile: CategoryTile; hidden: boolean }) {
  const focus = bannerFocusProps(tile.desktopFocus, tile.mobileFocus)
  return (
    <Link
      href={tile.href}
      aria-label={`Shop ${tile.label}`}
      tabIndex={hidden ? -1 : undefined}
      draggable={false}
      // 2.5 tiles across on desktop (the third is cut in half),
      // and as tall as the screen below the header so the strip fits in view.
      className="group relative block h-[min(60svh,500px)] w-[62vw] shrink-0 overflow-hidden bg-[#efefef] sm:h-[clamp(420px,calc(100svh-var(--main-navbar-height)),834px)] sm:w-[55vw] lg:w-[40vw]"
    >
      <Image
        src={tile.image}
        alt={tile.alt}
        fill
        draggable={false}
        sizes="(max-width: 639px) 62vw, (max-width: 1023px) 55vw, 40vw"
        className={cn("pointer-events-none object-cover object-center", focus.className)}
        style={focus.style}
      />
      {/* Keeps the label readable on light photos. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-true-black/55 to-transparent" />
      <span className="pointer-events-none absolute bottom-5 left-5 z-10 font-heading text-[20px] font-normal uppercase leading-none tracking-normal text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:bottom-6 sm:left-6 lg:text-[28px]">
        <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-current">
          {tile.label}
        </span>
      </span>
    </Link>
  )
}

/** Collection tiles in a continuously scrolling, draggable strip (repeats forever). */
export function CollectionCarousel({ slides }: { slides?: HomeCarouselSlide[] }) {
  const tiles = slides && slides.length > 0 ? slides.map(toTile) : DEFAULT_TILES
  const looping = [...tiles, ...tiles, ...tiles]

  const {
    viewportRef,
    trackRef,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClickCapture,
  } = useContinuousDraggableCarousel({ slideCount: tiles.length })

  return (
    <section className="w-full bg-white">
      <h2 className="sr-only">Shop by collection</h2>
      <div
        ref={viewportRef}
        className="continuous-carousel-viewport"
        aria-label="Shop by collection"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        {/* Tiles butt together (the shared track CSS adds a 1rem gap). */}
        <div ref={trackRef} className="continuous-carousel-track" style={{ gap: 0 }}>
          {looping.map((tile, index) => (
            <div key={`${tile.id}-${index}`} aria-hidden={index >= tiles.length}>
              <TileCard tile={tile} hidden={index >= tiles.length} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
