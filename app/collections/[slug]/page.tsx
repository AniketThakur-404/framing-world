import type { Metadata } from "next"
import { MouldingCatalogue } from "@/components/collection/MouldingCatalogue"
import { mouldingSpecs } from "@/lib/studio-content"
import { redirect } from "next/navigation"

import { CollectionBanner } from "@/components/collection/CollectionBanner"
import { CollectionBenefitsBar } from "@/components/collection/CollectionBenefitsBar"
import { CollectionRecommendations } from "@/components/collection/CollectionRecommendations"
import { CollectionTiles } from "@/components/collection/CollectionTiles"
import { ProductListing } from "@/components/collection/ProductListing"
import { parseSort, sortProducts } from "@/components/collection/productSort"
import {
  getPublishedCollectionBySlug,
  listPublishedCollectionsWithImages,
} from "@/lib/store/catalog"
import { listPublishedProducts } from "@/lib/store/catalog"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = await getPublishedCollectionBySlug(slug)

  if (!collection) {
    return {
      title: "Collection Not Found | Framing World",
    }
  }

  return {
    title: `${collection.title} | Framing World`,
    description: collection.description || `Browse the ${collection.title} collection at Framing World.`,
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const [collection, allProducts, collections] = await Promise.all([
    getPublishedCollectionBySlug(slug),
    listPublishedProducts(),
    listPublishedCollectionsWithImages(),
  ])

  if (!collection) {
    // Menu links may point at collections not
    // created or published yet; send shoppers to Shop All instead of a 404.
    redirect("/shop")
  }

  const sort = parseSort(query.sort)
  if (slug === "molding") return <MouldingCatalogue products={collection.products} specs={mouldingSpecs} />
  const products = sortProducts(
    collection.products,
    sort,
    allProducts.map((product) => product.id),
  )


  const otherCollections = collections.filter((item) => item.id !== collection.id)
  // Only intentionally configured editorial banners should span multiple columns.
  // Product portraits otherwise leave large empty spaces in those wide slots.
  const editorialImages = collection.editorialImages

  // A grid photo linked to a product shows that product's name and price under it.
  const productBySlug = new Map(
    [...allProducts, ...collection.products].map((product) => [product.slug, product]),
  )
  const captionedEditorial = editorialImages.map((image) => {
    const slug = image.href?.match(/^\/products\/([^/?#]+)/)?.[1]
    return { ...image, product: slug ? productBySlug.get(decodeURIComponent(slug)) : undefined }
  })

  const bannerSource = otherCollections.find((item) => item.image)
  const banner = collection.banner?.src
    ? { image: collection.banner.src, alt: collection.banner.alt, href: collection.banner.href }
    : bannerSource
    ? {
        image: bannerSource.image,
        alt: bannerSource.alt,
        href: `/collections/${bannerSource.slug}`,
      }
    : { image: "/images/home/hero-3.webp", alt: "Framing World", href: "/shop" }

  const collectionIds = new Set(collection.products.map((product) => product.id))
  const recommendations = [
    ...allProducts.filter((product) => !collectionIds.has(product.id)),
    ...allProducts.filter((product) => collectionIds.has(product.id)),
  ]

  return (
    <main className="flex-1 bg-white">
      <ProductListing
        id="products"
        title={collection.title}
        products={products}
        sort={sort}
        editorialImages={captionedEditorial}
        emptyState={
          <p className="py-16 text-center text-[14px] uppercase leading-[1.4] tracking-[0.04em] text-black/55">
            New pieces are on their way. Check back soon.
          </p>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8">
        <CollectionRecommendations products={recommendations} />
      </div>

      <CollectionTiles
        collections={collections.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          image: item.image,
          alt: item.alt,
        }))}
      />

      <div className="mt-0.5">
        <CollectionBanner {...banner} />
      </div>

      <CollectionBenefitsBar />
    </main>
  )
}
