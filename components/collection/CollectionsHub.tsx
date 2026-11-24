import { PictureRailGallery, type PictureRailItem } from "@/components/ui/picture-rail-gallery"
import { ProductListing } from "@/components/collection/ProductListing"
import { CollectionRecommendations } from "@/components/collection/CollectionRecommendations"
import { parseSort, sortProducts } from "@/components/collection/productSort"
import { resolvePage } from "@/lib/page-content"
import { getSiteContent } from "@/lib/store/site"
import {
  listPublishedCollectionsWithImages,
  listPublishedProducts,
} from "@/lib/store/catalog"

const FALLBACK_HERO = "/images/home/hero-2.webp"
export async function CollectionsHub({ sort: sortParam }: { sort?: string | string[] }) {
  const [collections, siteContent, products] = await Promise.all([listPublishedCollectionsWithImages(5), getSiteContent(), listPublishedProducts()])
  const sort = parseSort(sortParam)
  const sortedProducts = sortProducts(products, sort)
  const page = resolvePage("collectionsPage", siteContent.collectionsPage)
  const hero = collections.find((collection) => collection.image)
  const heroImage = page.text("hero", "src") || hero?.image || FALLBACK_HERO
  const galleryItems: PictureRailItem[] = siteContent.navigation.edits.filter((link) => link.href.startsWith("/collections/")).map((link, index) => {
    const collection = collections.find((entry) => `/collections/${entry.slug}` === link.href)
    return {
    id: link.href,
    title: link.label,
    href: link.href,
    image: collection?.image || heroImage,
    frame: (["oak", "black", "white"] as const)[index % 3],
    mat: true,
    aspect: index % 2 === 0 ? 0.8 : 1,
    drop: index % 2 === 0 ? 0 : 0.12,
    }
  })

  return (
    <div className="w-full bg-white text-black">

      {page.show("hero") ? (
        <PictureRailGallery
          items={galleryItems.length ? galleryItems : [{ id: "studio", title: "Framing World", image: heroImage, frame: "oak", mat: true }]}
          eyebrow="The Framing World collections"
          heading="A little inspiration for your walls"
          showCaption={false}
          className="py-8 sm:py-14 [&_header_h2]:font-heading [&_header_h2]:font-normal [&_header_h2]:sm:text-4xl"
        />
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

