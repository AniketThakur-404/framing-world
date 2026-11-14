"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { HeroIntro } from "@/components/home/HeroIntro"
import type { HomeHeroBanner } from "@/lib/store/banners"

const FRAME_COUNT = 240
const frameSrc = (i: number) =>
  `/framing_world_webp_frames/frame_${String(i + 1).padStart(4, "0")}.webp`

/** Frames that must be loaded before the intro opens onto the hero. */
const READY_FRAMES = 60
/** Never hold the intro longer than this on a slow connection. */
const READY_TIMEOUT_MS = 8000

/**
 * Scroll-driven hero: a 250vh section whose sticky canvas plays the 240-frame
 * sequence from first to last frame as the visitor scrolls through it.
 * A brand intro covers the page while the first frames load, then opens onto
 * the hero. No copy over the frames; a "Scroll to explore" hint follows the
 * cursor until scrolling starts, and the CTA appears at the end.
 * Title (for screen readers) and CTA come from the first hero banner in the admin.
 */
export function HeroFrameScroll({ banner }: { banner?: HomeHeroBanner }) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [framesReady, setFramesReady] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!section || !canvas || !ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const frames: HTMLImageElement[] = new Array(FRAME_COUNT)
    let current = -1
    let raf = 0

    // Draw the frame like object-fit: cover, at device pixel ratio.
    const draw = (index: number) => {
      // Fall back to the nearest frame that has loaded so far.
      let img: HTMLImageElement | undefined
      for (let d = 0; d < FRAME_COUNT; d++) {
        const a = frames[index - d]
        if (a?.complete && a.naturalWidth) { img = a; break }
        const b = frames[index + d]
        if (b?.complete && b.naturalWidth) { img = b; break }
      }
      if (!img) return
      const { width: cw, height: ch } = canvas
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    }

    const progress = () => {
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      return scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
    }

    const update = () => {
      raf = 0
      const p = reduceMotion ? 0 : progress()
      const index = Math.round(p * (FRAME_COUNT - 1))
      if (index !== current) {
        current = index
        draw(index)
      }
      // CTA appears only over the last stretch, once the sequence has played.
      if (ctaRef.current) {
        const c = reduceMotion ? 1 : Math.min(1, Math.max(0, (p - 0.8) / 0.2))
        ctaRef.current.style.opacity = String(c)
        ctaRef.current.style.transform = `translateY(${(1 - c) * 24}px)`
        ctaRef.current.style.pointerEvents = c > 0.5 ? "auto" : "none"
        ctaRef.current.inert = c <= 0.5
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      current = -1
      schedule()
    }

    // Tell the intro when enough frames are in to start playing smoothly.
    const needed = reduceMotion ? 1 : READY_FRAMES
    let readyCount = 0
    let signalled = false
    const signalReady = () => {
      if (signalled) return
      signalled = true
      setFramesReady(true)
    }
    const onSettled = (i: number) => {
      if (i >= needed) return
      if (++readyCount >= needed) signalReady()
    }
    const readyTimer = window.setTimeout(signalReady, READY_TIMEOUT_MS)

    // First frame right away, then the rest in order.
    const load = (i: number) => {
      const img = new Image()
      img.decoding = "async"
      img.src = frameSrc(i)
      img.onerror = () => onSettled(i)
      img.onload = () => {
        onSettled(i)
        if (i === 0 || Math.abs(i - current) < 3) {
          current = -1
          schedule()
        }
      }
      frames[i] = img
    }
    load(0)
    const toLoad = reduceMotion ? [] : Array.from({ length: FRAME_COUNT - 1 }, (_, k) => k + 1)
    let cursor = 0
    const pump = () => {
      // A few at a time so the first screen isn't starved of bandwidth.
      for (let n = 0; n < 8 && cursor < toLoad.length; n++) load(toLoad[cursor++])
      if (cursor < toLoad.length) loadTimer = window.setTimeout(pump, 60)
    }
    let loadTimer = window.setTimeout(pump, 120)

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("scroll", schedule, { passive: true })
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("scroll", schedule)
      window.clearTimeout(loadTimer)
      window.clearTimeout(readyTimer)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // "Scroll to explore": trails the cursor over the hero until scrolling starts.
  useEffect(() => {
    const section = sectionRef.current
    const hint = hintRef.current
    if (!section || !hint) return

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let x = window.innerWidth / 2
    let y = window.innerHeight * 0.62
    let tx = x
    let ty = y
    let inside = !finePointer
    let shown = -1
    let raf = 0

    const onMove = (e: PointerEvent) => {
      tx = e.clientX + 22
      ty = e.clientY - 6
      inside = true
    }
    const onLeave = () => {
      inside = !finePointer
    }

    const tick = () => {
      // Eased follow, so the label drifts after the cursor rather than snapping.
      const k = reduce ? 1 : 0.14
      x += (tx - x) * k
      y += (ty - y) * k
      const intro = document.documentElement.hasAttribute("data-hero-intro")
      const atTop = window.scrollY < 8
      const visible = !intro && atTop && inside ? 1 : 0
      if (visible !== shown) {
        shown = visible
        hint.style.opacity = String(visible)
      }
      if (finePointer) hint.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    if (finePointer) {
      section.addEventListener("pointermove", onMove)
      section.addEventListener("pointerleave", onLeave)
    }
    return () => {
      cancelAnimationFrame(raf)
      section.removeEventListener("pointermove", onMove)
      section.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  const title = banner?.title || "India's best custom framing and printing company"
  const ctaText = banner?.ctaText || "Shop Now"
  const ctaLink = banner?.ctaLink || "/collections/fine-art-prints"

  return (
    <section
      ref={sectionRef}
      data-no-text-reveal
      data-hero-scroll
      className="relative -mt-[var(--header-stack-height)] h-[250svh] w-full bg-black text-white motion-reduce:h-[100svh]"
    >
      <h2 className="sr-only">{title}</h2>

      <div className="sticky top-0 h-[100svh] min-h-[580px] w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-true-black/45 via-true-black/5 to-true-black/60" />

        <div
          ref={ctaRef}
          inert
          className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-4 opacity-0 will-change-transform sm:bottom-10 lg:bottom-12"
        >
          <Link
            href={ctaLink}
            className="inline-flex items-center justify-center border border-brand-cta bg-brand-cta px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white shadow-sm transition-colors hover:border-brand-terracotta hover:bg-brand-terracotta sm:px-7 sm:py-3 sm:text-[12px]"
          >
            {ctaText}
          </Link>
        </div>
      </div>

      {/* Fixed so it can follow the cursor; only visible at the very top of the page. */}
      <div
        ref={hintRef}
        aria-hidden
        className="hero-scroll-hint pointer-events-none fixed left-0 top-0 z-30 whitespace-nowrap opacity-0 transition-opacity duration-500 [@media(hover:none)]:bottom-8 [@media(hover:none)]:left-1/2 [@media(hover:none)]:top-auto [@media(hover:none)]:-translate-x-1/2"
      >
        Scroll to explore
      </div>

      <HeroIntro ready={framesReady} />
    </section>
  )
}
