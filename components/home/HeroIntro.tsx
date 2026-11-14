"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Page-load intro for the home hero, in three beats:
 *   1. Brand: light grey screen, the frame mark appears, then the wordmark decodes in.
 *   2. Open: the brand leaves and the hero is revealed through a band that grows
 *      from a thin line across the middle until it fills the screen.
 *   3. Done: the overlay goes, scrolling unlocks and the navbar slides in.
 *
 * Plays on a full page load (refresh / first visit). Client-side navigations back
 * to the home page skip it, since the frames are already loaded by then.
 */

/** Shortest time the brand beat is held, so it reads before the reveal. */
const BRAND_MIN_MS = 1500
/** Band reveal duration. */
const OPEN_MS = 850
/** Wordmark decode timing. */
const DECODE_DELAY_MS = 320
const DECODE_MS = 700

const WORD_LINES = ["FRAMING", "WORLD"]
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#/_<>"

// Survives client-side navigation, resets on a full page load.
let introPlayed = false

type Phase = "brand" | "open" | "done"

export function HeroIntro({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<Phase>(() =>
    // Skip on client-side returns, and when landing on a section link like /#bestsellers.
    introPlayed || (typeof window !== "undefined" && window.location.hash) ? "done" : "brand",
  )
  const overlayRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const brandShownAt = useRef(0)
  // Only undo what this intro set (other components share <html> styles).
  const lockedRef = useRef(false)
  const inertRef = useRef<HTMLElement[]>([])

  const release = () => {
    const root = document.documentElement
    if (lockedRef.current) {
      lockedRef.current = false
      root.style.overflow = ""
    }
    for (const el of inertRef.current) el.inert = false
    inertRef.current = []
  }

  // Beat 1: lock the page, hide the navbar, decode the wordmark.
  useEffect(() => {
    if (phase === "done") return
    introPlayed = true
    brandShownAt.current = performance.now()

    const root = document.documentElement
    const overlay = overlayRef.current
    // JS is running: cancel the CSS failsafe that hides the overlay if it never does.
    if (overlay) overlay.style.animation = "none"
    // SmoothMotion pauses Lenis while <html> has data-hero-intro; the navbar waits off-screen.
    root.setAttribute("data-hero-intro", "")
    if (!lockedRef.current) {
      lockedRef.current = true
      root.style.overflow = "hidden"
    }
    window.scrollTo(0, 0)

    // Keep keyboard focus inside the intro: make everything outside it inert.
    if (overlay && !inertRef.current.length) {
      for (let node: HTMLElement | null = overlay; node && node !== document.body; node = node.parentElement) {
        const parent: HTMLElement | null = node.parentElement
        if (!parent) break
        for (const sib of Array.from(parent.children)) {
          if (sib !== node && sib instanceof HTMLElement && !sib.inert) {
            sib.inert = true
            inertRef.current.push(sib)
          }
        }
      }
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    const start = performance.now() + DECODE_DELAY_MS
    const decode = () => {
      const t = (performance.now() - start) / DECODE_MS
      WORD_LINES.forEach((word, li) => {
        const el = lineRefs.current[li]
        if (!el) return
        if (reduce || t >= 1) {
          el.textContent = word
          return
        }
        if (t < 0) {
          el.textContent = ""
          return
        }
        // Letters settle left to right; the ones not settled yet flicker.
        const total = WORD_LINES.join("").length
        const offset = WORD_LINES.slice(0, li).join("").length
        let text = ""
        for (let i = 0; i < word.length; i++) {
          const settleAt = (offset + i + 1) / total
          if (t >= settleAt) text += word[i]
          else if (t >= settleAt - 0.35) text += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          else text += " "
        }
        el.textContent = text
      })
      if (!reduce && t < 1) raf = requestAnimationFrame(decode)
    }
    raf = requestAnimationFrame(decode)

    return () => cancelAnimationFrame(raf)
    // Runs once per mount of the intro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Beat 2: once frames are ready and the brand has been seen, open the band.
  useEffect(() => {
    if (phase !== "brand" || !ready) return
    const wait = Math.max(0, BRAND_MIN_MS - (performance.now() - brandShownAt.current))
    const timer = window.setTimeout(() => setPhase("open"), wait)
    return () => window.clearTimeout(timer)
  }, [phase, ready])

  useEffect(() => {
    if (phase !== "open") return
    const overlay = overlayRef.current
    if (!overlay) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      const t = window.setTimeout(() => setPhase("done"), 250)
      return () => window.clearTimeout(t)
    }

    let raf = 0
    const begin = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - begin) / OPEN_MS)
      // The overlay's own box (excludes any scrollbar gutter), so the band stays centred.
      const W = overlay.clientWidth
      const H = overlay.clientHeight
      overlay.style.clipPath = `path(evenodd, "M0 0H${W}V${H}H0Z ${bandPath(W, H, easeInOutCubic(p))}")`
      if (p < 1) raf = requestAnimationFrame(tick)
      else setPhase("done")
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  // Beat 3: release the page.
  useEffect(() => {
    if (phase !== "done") return
    release()
    // Next frame, so the navbar's slide-in transition runs.
    const raf = requestAnimationFrame(() => document.documentElement.removeAttribute("data-hero-intro"))
    return () => cancelAnimationFrame(raf)
     
  }, [phase])

  // Never leave the page locked if the hero unmounts mid-intro.
  useEffect(
    () => () => {
      release()
      document.documentElement.removeAttribute("data-hero-intro")
    },
     
    [],
  )

  if (phase === "done") return null

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-label="Loading Framing World"
      className="hero-intro fixed inset-0 z-[10050] bg-[#ebebea]"
    >
      <noscript>
        <style>{".hero-intro{display:none}"}</style>
      </noscript>
      <IntroLines />
      <div
        className="hero-intro-brand absolute inset-0 flex items-center justify-center"
        data-leaving={phase === "open" ? "" : undefined}
      >
        <div className="flex items-end gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-mark.png"
            alt=""
            width={67}
            height={101}
            className="hero-intro-mark h-[60px] w-auto sm:h-[68px]"
          />
          <div
            aria-hidden
            className="mb-[1px] flex w-[6.4em] flex-col font-sans text-[18px] font-normal uppercase leading-[1.12] tracking-[0.02em] text-[#383838] sm:text-[20px]"
          >
            {WORD_LINES.map((word, i) => (
              <span
                key={word}
                ref={(el) => {
                  lineRefs.current[i] = el
                }}
                className="block whitespace-pre"
              >
                {" "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Faint rounded outlines in the corners of the intro screen. */
function IntroLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      fill="none"
      stroke="rgba(32,59,89,0.12)"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    >
      <path vectorEffect="non-scaling-stroke" d="M395 0V40Q395 80 355 80H130Q90 80 90 120V250Q90 290 50 290H0" />
      <path vectorEffect="non-scaling-stroke" d="M600 0V90Q600 130 640 130H860Q900 130 900 170V230Q900 270 940 270H1000" />
      <path vectorEffect="non-scaling-stroke" d="M0 470H150Q190 470 190 510V520L120 600" />
      <path vectorEffect="non-scaling-stroke" d="M700 600V510Q700 470 740 470H930Q960 470 980 490L1000 510" />
    </svg>
  )
}

/**
 * The opening band, as an SVG path in screen pixels: a rounded centre band that
 * tapers through curved shoulders into a thin strip running to both edges.
 * At e = 0 it is a hairline; by e = 1 it covers the whole screen.
 */
function bandPath(W: number, H: number, e: number) {
  const cy = H / 2
  const inner = e * (H + 200)
  const shoulder = Math.min(inner / 2, 70)
  const outer = Math.max(2, inner - shoulder * 2)
  const inset = W * (0.13 - 0.095 * Math.min(1, e * 2.5))
  const flare = Math.min(inset, Math.max(24, shoulder * 1.6))

  const yi = cy - inner / 2
  const yo = cy - outer / 2
  const ybi = cy + inner / 2
  const ybo = cy + outer / 2
  const l0 = inset - flare
  const lc = inset - flare / 2
  const r0 = W - inset + flare
  const rc = W - inset + flare / 2
  const n = (v: number) => v.toFixed(1)

  return [
    `M0 ${n(yo)}`,
    `L${n(l0)} ${n(yo)}`,
    `C${n(lc)} ${n(yo)} ${n(lc)} ${n(yi)} ${n(inset)} ${n(yi)}`,
    `L${n(W - inset)} ${n(yi)}`,
    `C${n(rc)} ${n(yi)} ${n(rc)} ${n(yo)} ${n(r0)} ${n(yo)}`,
    `L${W} ${n(yo)}`,
    `L${W} ${n(ybo)}`,
    `L${n(r0)} ${n(ybo)}`,
    `C${n(rc)} ${n(ybo)} ${n(rc)} ${n(ybi)} ${n(W - inset)} ${n(ybi)}`,
    `L${n(inset)} ${n(ybi)}`,
    `C${n(lc)} ${n(ybi)} ${n(lc)} ${n(ybo)} ${n(l0)} ${n(ybo)}`,
    `L0 ${n(ybo)}Z`,
  ].join("")
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
