"use client"

import Lenis from "lenis"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * Site-wide motion: Lenis smooth (inertia) scrolling plus scroll-linked image
 * effects. The effects only write CSS variables; the look lives in
 * globals.css ("Scroll-linked motion").
 *
 *   data-parallax          photo drifts slowly against the scroll (--parallax: -1…1)
 *   data-parallax="out"    hero: media sinks and copy lifts away as it scrolls off (--parallax-out: 0…1)
 *   data-unfold            banner opens from a smaller frame as it enters (--unfold: 0…1)
 *
 * Everything is skipped for visitors who prefer reduced motion.
 */
export function SmoothMotion() {
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  const lenisRef = useRef<Lenis | null>(null)

  // Keep admin forms and nested lists on native browser scrolling.
  useEffect(() => {
    if (isDashboard) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
      autoRaf: true,
      // Let drawers, dialogs and inner scroll areas scroll natively.
      prevent: (node) => Boolean(node.closest?.('[role="dialog"], [data-lenis-prevent], [data-radix-scroll-area-viewport], [role="region"]')),
    })

    // Pause while a dialog or drawer locks the page (Radix sets data-scroll-locked on <body>)
    // or while the home intro covers it (HeroIntro sets data-hero-intro on <html>).
    const syncLock = () => {
      const locked =
        document.body.hasAttribute("data-scroll-locked") ||
        document.documentElement.hasAttribute("data-hero-intro")
      if (locked) lenis.stop()
      else lenis.start()
    }
    lenisRef.current = lenis

    const lockObserver = new MutationObserver(syncLock)
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] })
    lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-hero-intro"] })
    syncLock()

    return () => {
      lockObserver.disconnect()
      lenis.destroy()
      lenisRef.current = null
    }
  }, [isDashboard])

  // New page: start at the top. Lenis keeps its own scroll target, so without
  // this it drags the page back to the previous position after navigation.
  useEffect(() => {
    if (window.location.hash) return
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
  }, [pathname])

  // Scroll-linked effects, re-scanned on every page.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const visible = new Set<HTMLElement>()
    const tracked = new Set<HTMLElement>()
    let frame = 0

    const update = () => {
      frame = 0
      const vh = window.innerHeight
      for (const el of visible) {
        const rect = el.getBoundingClientRect()
        if (el.hasAttribute("data-unfold")) {
          // 0 when the top edge enters at the bottom, 1 once it reaches 25% from the top.
          const progress = (vh - rect.top) / (vh * 0.75)
          el.style.setProperty("--unfold", clamp(progress, 0, 1).toFixed(4))
        } else if (el.dataset.parallax === "out") {
          el.style.setProperty("--parallax-out", clamp(-rect.top / rect.height, 0, 1).toFixed(4))
        } else {
          // -1 entering at the bottom, 0 centred, 1 leaving at the top.
          const progress = (vh - rect.top) / (vh + rect.height)
          el.style.setProperty("--parallax", (clamp(progress, 0, 1) * 2 - 1).toFixed(4))
        }
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) visible.add(el)
          else visible.delete(el)
        }
        schedule()
      },
      { rootMargin: "10% 0px" },
    )

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-parallax], [data-unfold]").forEach((el) => {
        if (tracked.has(el)) return
        tracked.add(el)
        // Start banners closed so they open as they arrive.
        if (el.hasAttribute("data-unfold") && el.getBoundingClientRect().top > window.innerHeight) {
          el.style.setProperty("--unfold", "0")
        }
        io.observe(el)
      })
    }
    scan()

    let scanFrame = 0
    const mutations = new MutationObserver(() => {
      if (!scanFrame) scanFrame = requestAnimationFrame(() => ((scanFrame = 0), scan()))
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    schedule()

    return () => {
      io.disconnect()
      mutations.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(scanFrame)
    }
  }, [pathname])

  return null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
