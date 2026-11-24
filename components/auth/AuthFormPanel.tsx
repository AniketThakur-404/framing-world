import type { ReactNode } from "react"

/**
 * Right-hand column of the login and sign-up pages. On desktop the form sits
 * in the vertical middle of the panel; a form taller than the screen scrolls
 * inside the panel instead of being cut off (auto margins never clip).
 */
export function AuthFormPanel({ children }: { children: ReactNode }) {
  return (
    <section className="flex w-full flex-col items-center bg-white px-4 py-12 sm:px-8 sm:py-16 lg:overflow-y-auto lg:px-16 lg:py-0 xl:px-24">
      <div className="w-full max-w-[440px] sm:max-w-[460px] lg:my-auto lg:py-12">
        {children}
      </div>
    </section>
  )
}
