"use client"

import { ProductCardView, type ProductCard } from "@/components/home/TrendingSection"
import { ScrollRow } from "@/components/ScrollRow"

const CAROUSEL_SIZE = 6

/** Homepage "You May Also Like": a horizontal, scroll-snapping row of 6 cards. */
export function RecommendedSection({
  products = [],
}: {
  products?: ProductCard[]
  /** Kept for callers that still pass it; there are no placeholder cards any more. */
  usePlaceholders?: boolean
}) {
  const displayProducts = products.slice(0, CAROUSEL_SIZE)
  if (displayProducts.length === 0) return null

  return (
    <section className="w-full bg-white py-10 md:py-16 text-black">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <h2 data-reveal="up" className="type-title">
          You May Also Like
        </h2>
      </div>

      <ScrollRow
        className="reveal-stagger mt-6 sm:mt-8 items-start gap-0.5 px-3 sm:gap-1 sm:px-6 lg:px-8"
        label="You may also like"
      >
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="w-[46vw] shrink-0 snap-start sm:w-[34vw] md:w-[26vw] lg:w-[calc((100%-5*0.25rem)/6)]"
          >
            <ProductCardView product={product} variant="compact" />
          </div>
        ))}
      </ScrollRow>
    </section>
  )
}
