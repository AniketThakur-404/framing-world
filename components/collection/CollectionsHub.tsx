import { CollectionRail } from "@/components/collection/CollectionRail"
import { ProductListing } from "@/components/collection/ProductListing"
import { CollectionRecommendations } from "@/components/collection/CollectionRecommendations"
import { parseSort, sortProducts } from "@/components/collection/productSort"
import { resolvePage } from "@/lib/page-content"
import { getSiteContent } from "@/lib/store/site"
import { listPublishedCollectionsWithImages, listPublishedProducts } from "@/lib/store/catalog"

const FALLBACK_HERO = "/images/home/hero-2.webp"
export async function CollectionsHub({ sort: sortParam }: { sort?: string | string[] }) {
  const [collections, siteContent, products] = await Promise.all([listPublishedCollectionsWithImages(5), getSiteContent(), listPublishedProducts()])
  const sort = parseSort(sortParam)
  const sortedProducts = sortProducts(products, sort)
  const page = resolvePage("collectionsPage", siteContent.collectionsPage)
  const hero = collections.find((collection) => collection.image)
  const heroImage = page.text("hero", "src") || hero?.image || FALLBACK_HERO

  return (
    <div className="w-full bg-white text-black">

      {page.show("hero") ? (
        <CollectionRail fallbackImage={heroImage} />
      ) : null}

      <ProductListing
        id="collection-selection"
        title="All Products"
        products={sortedProducts}
        sort={sort}
        pageSize={16}
        emptyState={<p className="py-12 text-center text-black/60">No products are available yet.</p>}
      />
      <div className="px-4 sm:px-6 lg:px-8">
        <CollectionRecommendations products={products.slice(0, 6)} />
      </div>
    </div>
  )
}

