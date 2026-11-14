"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { bannerFocusProps, isVideoMedia } from "@/lib/banner-media"
import { cn } from "@/lib/utils"
import type { HomeHeroBanner } from "@/lib/store/banners"

const defaultFallbackBanner: HomeHeroBanner = {
  id: "default-hero",
  title: "India's best custom framing and printing company",
  subtitle:
    "A premium destination for custom framing and archival printing, combining craftsmanship with museum-grade materials to preserve your art with perfection.",
  desktopImageUrl: "/images/home/hero-1.jpg",
  mobileImageUrl: "/images/home/mobile/hero-1.jpg",
  ctaText: "Shop Now",
  ctaLink: "/collections/fine-art-prints",
  textAlignment: "CENTER",
  overlayOpacity: 70,
}

/** Full-bleed hero media: a muted looping video for .mp4/.webm, otherwise an image. */
function HeroMedia({
  src,
  alt,
  priority,
  sizes = "100vw",
  focus = {},
}: {
  src: string
  alt: string
  priority: boolean
  /** The phone/desktop variants are each hidden at the other size. */
  sizes?: string
  /** Crop focus chosen in the admin. */
  focus?: ReturnType<typeof bannerFocusProps>
}) {
  if (isVideoMedia(src)) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        aria-label={alt}
        className={cn("absolute inset-0 h-full w-full object-cover object-center", focus.className)}
        style={focus.style}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover object-center w-full h-full", focus.className)}
      style={focus.style}
    />
  )
}

export function Hero({ banners }: { banners?: HomeHeroBanner[] }) {
  const slides = banners && banners.length > 0 ? banners : [defaultFallbackBanner]
  const [activeSlide, setActiveSlide] = useState(0)

  // Continuous auto-rotation every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section
      data-parallax="out"
      // The hero copy has its own load animation, so skip the heading mask reveal.
      data-no-text-reveal
      className="relative -mt-[var(--header-stack-height)] w-full h-[100svh] min-h-[580px] bg-black text-white overflow-hidden"
    >
      {slides.map((slide, index) => {
        const isActive = index === activeSlide

        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
              isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0",
            )}
          >
            {/* Full-screen hero image covering full viewport without black letterboxing */}
            <div data-parallax-media className="hero-settle relative w-full h-full">
              {slide.mobileImageUrl ? (
                <>
                  <div className="relative block sm:hidden w-full h-full">
                    <HeroMedia src={slide.mobileImageUrl} alt={slide.title || "Hero Banner"} priority={index === 0} sizes="(max-width: 639px) 100vw, 1px" focus={bannerFocusProps(slide.desktopFocus, slide.mobileFocus)} />
                  </div>
                  <div className="relative hidden sm:block w-full h-full">
                    <HeroMedia src={slide.desktopImageUrl} alt={slide.title || "Hero Banner"} priority={index === 0} sizes="(min-width: 640px) 100vw, 1px" focus={bannerFocusProps(slide.desktopFocus, slide.mobileFocus)} />
                  </div>
                </>
              ) : (
                <HeroMedia src={slide.desktopImageUrl} alt={slide.title || "Hero Banner"} priority={index === 0} focus={bannerFocusProps(slide.desktopFocus, slide.mobileFocus)} />
              )}

              {/* Gradient Dark Overlay */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-true-black/45 via-true-black/10 to-true-black/75"
                style={{
                  opacity: Math.max(0.2, (slide.overlayOpacity ?? 15) / 100),
                }}
              />
            </div>

            {/* The whole slide is clickable; the button below sits on top of it */}
            {slide.ctaLink && (
              <Link
                href={slide.ctaLink}
                tabIndex={slide.ctaText || !isActive ? -1 : undefined}
                className="absolute inset-0 z-10"
                aria-label={slide.title || slide.ctaText || "Hero banner"}
              />
            )}

            {/* Content & CTA Button (Only rendered if title, subtitle, or button exists) */}
            {(slide.title || slide.subtitle || slide.ctaText) && (
              <div
                data-parallax-copy
                className={cn(
                  "hero-rise absolute inset-x-0 bottom-12 sm:bottom-10 lg:bottom-12 z-20 px-4 sm:px-8 flex flex-col pointer-events-none",
                  slide.textAlignment === "LEFT"
                    ? "items-start text-left max-w-7xl mx-auto"
                    : slide.textAlignment === "RIGHT"
                      ? "items-end text-right max-w-7xl mx-auto"
                      : "items-center text-center justify-center",
                )}
              >
                {slide.title && (
                  <h2 className="max-w-[28ch] text-white text-[22px] sm:text-[30px] lg:text-[38px] font-heading font-normal uppercase tracking-normal drop-shadow-md leading-[1.15]">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="mt-2 max-w-[52ch] text-white/90 text-[12px] sm:text-[14px] lg:text-[15px] leading-[1.5] tracking-normal font-normal drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                )}

                {slide.ctaText && (
                  <div className={cn(slide.title || slide.subtitle ? "mt-4 sm:mt-5" : "")}>
                    <Link
                      href={slide.ctaLink || "/collections"}
                      className="inline-flex cursor-pointer pointer-events-auto items-center justify-center border border-brand-cta bg-brand-cta px-5 py-2.5 sm:px-7 sm:py-3 text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:border-brand-terracotta hover:bg-brand-terracotta shadow-sm"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Slide indicator bars (same style as the product-card photo bars) */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 sm:bottom-5 z-30 flex items-center justify-center drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === activeSlide ? "true" : undefined}
              className="group/ind flex cursor-pointer items-center justify-center px-1 py-2"
            >
              <span
                className={cn(
                  "block h-[3px] w-8 transition-colors duration-200 lg:w-10",
                  idx === activeSlide ? "bg-white" : "bg-white/70 group-hover/ind:bg-white",
                )}
              />
            </button>
          ))}
        </div>
      )}

      {/* Screen-reader anchors preserved */}
      <span id="women" className="sr-only">
        Women
      </span>
      <span id="men" className="sr-only">
        Men
      </span>
      <span id="contact" className="sr-only">
        Contact Us
      </span>
      <span id="collections" className="sr-only">
        Collection
      </span>
    </section>
  )
}
