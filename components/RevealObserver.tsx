"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Scroll-reveal for the storefront. Any element with a `data-reveal` attribute
 * ("up", "fade", "zoom", "text") starts hidden and animates in when it scrolls
 * into view; the look lives in globals.css (.reveal-ready). Page headings
 * (h1/h2 inside <main>) get "text" automatically: they rise out of a mask.
 *
 * Content is only hidden once this script runs, so pages still show
 * everything without JavaScript. Elements already on screen when it starts are
 * shown immediately, so nothing flickers.
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const root = document.documentElement

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add("is-revealed")
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    )

    // Masked headings ("text") are fully clipped by their own clip-path while
    // hidden, and browsers report a clipped element as not intersecting, so an
    // IntersectionObserver never fires for them. They are revealed from their
    // position on scroll instead.
    const pendingText = new Set<HTMLElement>()
    let frame = 0
    const revealText = () => {
      frame = 0
      const limit = window.innerHeight * 0.92
      for (const el of pendingText) {
        if (!el.isConnected) {
          pendingText.delete(el)
          continue
        }
        const rect = el.getBoundingClientRect()
        // While hidden the heading sits one line-box lower (translateY(100%)).
        if (rect.top - rect.height < limit) {
          el.classList.add("is-revealed")
          pendingText.delete(el)
        }
      }
    }
    const scheduleText = () => {
      if (!frame && pendingText.size > 0) frame = window.requestAnimationFrame(revealText)
    }
    const track = (el: HTMLElement) => {
      if (el.dataset.reveal === "text") {
        pendingText.add(el)
        scheduleText()
      } else {
        observer.observe(el)
      }
    }

    const watch = (scope: ParentNode) => {
      // Headings rise out of a mask (layered on any block reveal around them).
      scope.querySelectorAll<HTMLElement>("main h1, main h2").forEach((el) => {
        if (el.closest("[data-no-text-reveal], [role='dialog']")) return
        // A heading's own plain fade-up is upgraded too; zoom etc. are left alone.
        if (el.hasAttribute("data-reveal") && el.dataset.reveal !== "up") return
        if (el.classList.contains("sr-only")) return
        el.dataset.reveal = "text"
      })
      scope.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)").forEach((el) => {
        // Already visible at start: show without animating.
        if (!root.classList.contains("reveal-ready") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-revealed")
          return
        }
        track(el)
      })
    }

    watch(document)
    root.classList.add("reveal-ready")
    window.addEventListener("scroll", scheduleText, { passive: true })
    window.addEventListener("resize", scheduleText)

    // Sections rendered later (client navigation, lazy content).
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches("[data-reveal]")) track(node)
            watch(node)
          }
        })
      }
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutations.disconnect()
      window.removeEventListener("scroll", scheduleText)
      window.removeEventListener("resize", scheduleText)
      if (frame) window.cancelAnimationFrame(frame)
      pendingText.clear()
    }
  }, [pathname])

  return null
}
