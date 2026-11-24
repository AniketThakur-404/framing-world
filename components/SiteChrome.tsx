"use client"

import { usePathname } from "next/navigation"

import { SiteFooter } from "@/components/SiteFooter"
import { SiteHeader } from "@/components/SiteHeader"
import { cn } from "@/lib/utils"

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // The admin dashboard has its own sidebar, so it gets no store header or footer.
  const isMinimalChrome = pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  return (
    <>
      {isMinimalChrome ? null : <SiteHeader />}
      <div
        className={cn(
          "flex flex-1 flex-col",
          !isMinimalChrome && "pt-[var(--header-stack-height)]"
        )}
      >
        {children}
      </div>
      {isMinimalChrome ? null : <SiteFooter />}
    </>
  )
}
