"use client"

import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Rows per page on every dashboard list. */
export const DASHBOARD_PAGE_SIZE = 50

/** The page slice for a list, with the page clamped to what exists. */
export function paginate<T>(items: T[], page: number, pageSize = DASHBOARD_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize
  return { currentPage, totalPages, start, pageItems: items.slice(start, start + pageSize) }
}

/** 1 … 4 5 [6] 7 8 … 151: first, last and two either side of the current page. */
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "gap")[] = [1]
  const from = Math.max(2, Math.min(current - 2, total - 5))
  const to = Math.min(total - 1, Math.max(current + 2, 6))
  if (from > 2) pages.push("gap")
  for (let n = from; n <= to; n++) pages.push(n)
  if (to < total - 1) pages.push("gap")
  pages.push(total)
  return pages
}

const buttonClass =
  "grid h-7 min-w-7 place-items-center rounded-md px-1.5 text-xs font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:cursor-not-allowed disabled:opacity-40"

/**
 * Footer for dashboard tables: "1–50 of 7531", numbered pages and
 * previous / next. `children` sits between the count and the pages
 * (for a status such as "Updating…").
 */
export function DashboardPagination({
  page,
  totalItems,
  onPageChange,
  pageSize = DASHBOARD_PAGE_SIZE,
  className,
  children,
}: {
  page: number
  totalItems: number
  onPageChange: (page: number) => void
  pageSize?: number
  className?: string
  children?: ReactNode
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * pageSize
  const go = (next: number) => onPageChange(Math.min(Math.max(1, next), totalPages))

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-t border-black/10 px-3 py-2 text-xs text-black/60",
        className,
      )}
    >
      <span className="tabular-nums">
        {totalItems === 0 ? "0 items" : `${start + 1}–${Math.min(start + pageSize, totalItems)} of ${totalItems}`}
      </span>
      {children}
      {totalPages > 1 ? (
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => go(current - 1)}
            className={cn(buttonClass, "bg-black/5 hover:bg-black/10")}
          >
            <ChevronLeft className="size-4" />
          </button>
          {pageNumbers(current, totalPages).map((n, index) =>
            n === "gap" ? (
              <span key={`gap-${index}`} aria-hidden className="px-1 text-black/40">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                aria-label={`Page ${n}`}
                aria-current={n === current ? "page" : undefined}
                onClick={() => go(n)}
                className={cn(
                  buttonClass,
                  n === current ? "bg-black text-white" : "text-black/70 hover:bg-black/[0.06]",
                )}
              >
                {n}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={current === totalPages}
            onClick={() => go(current + 1)}
            className={cn(buttonClass, "bg-black/5 hover:bg-black/10")}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </nav>
  )
}
