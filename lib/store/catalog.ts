import collectionsJson from "@/content/framingworld/catalog/collections.json"
import productsJson from "@/content/framingworld/catalog/products.json"
import type { ProductCard } from "@/components/home/TrendingSection"
import type { ProductDetail } from "@/components/product/productData"
import {
  buildOptionGroups,
  cardSizes,
  priceBySize,
  readVariantChoices,
  type OptionGroup,
  type VariantChoice,
} from "@/lib/product-options"
import { SYNONYM_MAP, damerauLevenshteinDistance } from "@/lib/search/fuzzy"
import { DEFAULT_SITE_CONTENT } from "@/lib/site-content"
import {
  listPublishedProducts as dalListPublishedProducts,
  getProductBySlug as dalGetProductBySlug,
} from "@/lib/server/dal/products"
import {
  getPublishedCollectionBySlug as dalGetPublishedCollectionBySlug,
  listPublishedCollectionsWithImages as dalListPublishedCollectionsWithImages,
} from "@/lib/server/dal/collections"
import { searchCatalog as dalSearchCatalog } from "@/lib/server/dal/search"

/**
 * The product catalogue, read straight from content/framingworld/catalog
 * (no database). Edit those JSON files to change products, prices or
 * collections.
 */

type CatalogVariant = {
  title: string
  options: Record<string, string>
  price: number
  compareAtPrice: number | null
  available: boolean
}

type CatalogProduct = {
  handle: string
  title: string
  description: string
  tags: string[]
  publishedAt: string
  category: string | null
  collections: string[]
  images: { src: string; alt: string }[]
  variants: CatalogVariant[]
}

type CatalogCollection = {
  handle: string
  title: string
  description: string
  productHandles: string[]
}

const products = productsJson as unknown as CatalogProduct[]
const collections = (collectionsJson as unknown as CatalogCollection[]).filter(
  (collection) => collection.handle !== "frontpage" && collection.productHandles.length > 0,
)
const productByHandle = new Map(products.map((product) => [product.handle, product]))
const collectionByHandle = new Map(collections.map((collection) => [collection.handle, collection]))

/** Cover photos for the main collections; the rest use their first product photo. */
const COLLECTION_IMAGES: Record<string, string> = {
  "wall-gallery": "/images/home/tile-frame-wall-gallery.jpg",
  "imported-wooden-frames": "/images/home/hero-2.webp",
  "best-selling-frames": "/images/home/tile-best-selling-frames.jpg",
  "fine-art-prints": "/images/home/home-consultation.jpg",
  molding: "/images/home/hero-1.jpg",
}

/** Newest first, as on the live store. */
const newestFirst = [...products].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

const rupees = (value: number) => `₹${Number.isInteger(value) ? value : value.toFixed(2)}`

function choicesFor(product: CatalogProduct): VariantChoice[] {
  return readVariantChoices(
    product.variants.map((variant) => {
      const values = Object.values(variant.options)
      return {
        price: rupees(variant.price).slice(1),
        compareAtPrice: variant.compareAtPrice ? rupees(variant.compareAtPrice).slice(1) : null,
        inventoryQuantity: variant.available ? 1 : 0,
        optionValues: values.length > 0 ? { Size: values.join(" / "), Options: variant.options } : null,
      }
    }),
  )
}

function categoryOf(product: CatalogProduct) {
  const collection = product.category ? collectionByHandle.get(product.category) : undefined
  return collection ? { name: collection.title, slug: collection.handle } : null
}

export type CatalogProductCard = ProductCard & { isInStock: boolean }

function toCard(product: CatalogProduct): CatalogProductCard {
  const choices = choicesFor(product)
  const first = product.variants[0]
  const gallery = product.images.slice(0, 5).map((image) => image.src)
  return {
    id: product.handle,
    title: product.title,
    slug: product.handle,
    description: product.description || null,
    category: categoryOf(product),
    lineName: null,
    price: first ? rupees(first.price) : null,
    compareAtPrice: first?.compareAtPrice ? rupees(first.compareAtPrice) : null,
    isInStock: product.variants.some((variant) => variant.available),
    image: gallery[0] ?? "/images/home/tile-best-selling-frames.jpg",
    alt: product.images[0]?.alt || product.title,
    gallery,
    sizes: cardSizes(choices),
    priceBySize: priceBySize(choices),
    swatches: [],
    badge: undefined,
  }
}

export async function listPublishedProducts(
  options: { collectionId?: string; excludeProductId?: string; take?: number; ids?: string[] } = {},
): Promise<CatalogProductCard[]> {
  try {
    const dbProducts = await dalListPublishedProducts(options)
    if (dbProducts !== undefined && dbProducts !== null) {
      return dbProducts as CatalogProductCard[]
    }
  } catch (error) {
    console.error("[catalog] DB listPublishedProducts failed, using fallback:", error)
  }

  let list: CatalogProduct[]
  if (options.ids) {
    list = options.ids.map((id) => productByHandle.get(id)).filter((p): p is CatalogProduct => Boolean(p))
  } else if (options.collectionId) {
    list = (collectionByHandle.get(options.collectionId)?.productHandles ?? [])
      .map((handle) => productByHandle.get(handle))
      .filter((p): p is CatalogProduct => Boolean(p))
  } else {
    list = newestFirst
  }
  if (options.excludeProductId) list = list.filter((product) => product.handle !== options.excludeProductId)
  if (options.take !== undefined) list = list.slice(0, options.take)
  return list.map(toCard)
}

/* ───────────────────────────── Product page ───────────────────────────── */

export type CatalogProductDetail = ProductDetail & {
  id: string
  isDraft: boolean
  seoTitle: string
  seoDescription: string
  alsoLikeIds: string[]
  optionGroups: OptionGroup[]
  variantChoices: VariantChoice[]
  priceBySize: Record<string, string>
}

function textLines(text: string) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean)
}

export async function getProductBySlug(slug: string): Promise<CatalogProductDetail | null> {
  try {
    const dbProduct = await dalGetProductBySlug(slug)
    if (dbProduct) {
      return dbProduct as unknown as CatalogProductDetail
    }
  } catch (error) {
    console.error("[catalog] DB getProductBySlug failed, using fallback:", error)
  }

  const product = productByHandle.get(slug)
  if (!product) return null

  const choices = choicesFor(product)
  const category = categoryOf(product)
  const shared = DEFAULT_SITE_CONTENT.productPage
  const first = product.variants[0]
  const gallery = product.images.map((image) => ({ src: image.src, alt: image.alt || product.title, objectPosition: "center" }))

  const primary = product.category ? collectionByHandle.get(product.category) : undefined
  const moreFromProducts = primary
    ? (await listPublishedProducts({ collectionId: primary.handle, excludeProductId: product.handle, take: 8 }))
    : []

  const shippingSections = (
    [
      ["Shipping", shared.shipping],
      ["Returns", shared.returns],
    ] as const
  )
    .map(([title, text]) => ({ title, lines: textLines(text) }))
    .filter((section) => section.lines.length > 0)

  return {
    id: product.handle,
    slug: product.handle,
    isDraft: false,
    editLabel: (category?.name ?? "Framing World").toUpperCase(),
    title: product.title,
    seoTitle: "",
    seoDescription: "",
    breadcrumb: [
      { label: "Homepage", href: "/" },
      { label: "Collections", href: "/collections" },
      ...(category ? [{ label: category.name, href: `/collections/${category.slug}` }] : []),
      { label: product.title },
    ],
    originalPrice: first?.compareAtPrice ? rupees(first.compareAtPrice) : null,
    price: first ? rupees(first.price) : "Price on request",
    description: product.description,
    subtitle: "",
    modelInfo: "",
    fitNote: "",
    fitHeadline: "",
    fitText: "",
    features: [],
    highlightStrip: [],
    bundleLine: "",
    origin: shared.origin,
    shippingSections,
    highlightsIntro: "",
    highlights: [],
    lifestyleImage: null,
    moreFrom:
      primary && moreFromProducts.length > 0
        ? { title: primary.title, href: `/collections/${primary.handle}`, products: moreFromProducts }
        : null,
    completeLookProducts: [],
    alsoLikeIds: [],
    offers: [],
    details: [],
    detailsBody: product.description,
    careNotes: [],
    shippingNotes: shippingSections.flatMap((section) => section.lines),
    colorName: "Default",
    colors: [{ name: "Default", value: "#203b59" }],
    sizes: choices.map((choice) => choice.size),
    optionGroups: buildOptionGroups(choices),
    variantChoices: choices,
    priceBySize: priceBySize(choices),
    gallery: gallery.length > 0 ? gallery : [{ src: "/images/home/home-consultation.jpg", alt: product.title, objectPosition: "center" }],
    deliveryPerks: [],
    completeLook: gallery.slice(0, 3),
    fitType: "regular",
  }
}

/* ───────────────────────────── Collections ───────────────────────────── */

function collectionCover(collection: CatalogCollection) {
  return (
    COLLECTION_IMAGES[collection.handle] ??
    collection.productHandles.map((handle) => productByHandle.get(handle)?.images[0]?.src).find(Boolean) ??
    ""
  )
}

export type PublishedCollectionDetail = {
  id: string
  title: string
  slug: string
  description: string | null
  image: string
  alt: string
  products: CatalogProductCard[]
  editorialImages: { src: string; alt: string; href?: string; caption?: string }[]
  banner: { src: string; alt: string; href?: string; caption?: string } | null
}

export async function getPublishedCollectionBySlug(slug: string): Promise<PublishedCollectionDetail | null> {
  try {
    const dbCollection = await dalGetPublishedCollectionBySlug(slug)
    if (dbCollection) {
      return dbCollection as unknown as PublishedCollectionDetail
    }
  } catch (error) {
    console.error("[catalog] DB getPublishedCollectionBySlug failed, using fallback:", error)
  }

  const collection = collectionByHandle.get(slug)
  if (!collection) return null
  return {
    id: collection.handle,
    title: collection.title,
    slug: collection.handle,
    description: collection.description || null,
    image: collectionCover(collection),
    alt: collection.title,
    products: await listPublishedProducts({ collectionId: collection.handle }),
    editorialImages: [] as { src: string; alt: string; href?: string; caption?: string }[],
    banner: null as { src: string; alt: string; href?: string; caption?: string } | null,
  }
}

export type PublishedCollectionWithImages = {
  id: string
  title: string
  slug: string
  description: string | null
  productCount: number
  image: string
  alt: string
  images: { src: string; alt: string }[]
}

export async function listPublishedCollectionsWithImages(maxImages = 5): Promise<PublishedCollectionWithImages[]> {
  try {
    const dbCollections = await dalListPublishedCollectionsWithImages(maxImages)
    if (dbCollections && dbCollections.length > 0) {
      return dbCollections
    }
  } catch (error) {
    console.error("[catalog] DB listPublishedCollectionsWithImages failed, using fallback:", error)
  }

  return collections.map((collection) => {
    const cover = collectionCover(collection)
    const productImages = collection.productHandles
      .map((handle) => productByHandle.get(handle))
      .filter((p): p is CatalogProduct => Boolean(p))
      .flatMap((product) => (product.images[0] ? [{ src: product.images[0].src, alt: product.title }] : []))
    const images = [{ src: cover, alt: collection.title }, ...productImages.filter((image) => image.src !== cover)]
      .filter((image) => image.src)
      .slice(0, maxImages)
    return {
      id: collection.handle,
      title: collection.title,
      slug: collection.handle,
      description: collection.description || null,
      productCount: collection.productHandles.length,
      image: cover,
      alt: collection.title,
      images,
    }
  })
}

/* ───────────────────────────── Search ───────────────────────────── */

export type SearchProductResult = {
  id: string
  title: string
  slug: string
  categoryName: string | null
  price: string
  compareAtPrice: string | null
  image: string
  alt: string
  badge?: string
  isInStock: boolean
  score: number
}

export type SearchResponse = {
  query: string
  suggestion: string | null
  hasExactMatch: boolean
  products: SearchProductResult[]
  categories: { id: string; name: string; slug: string }[]
  collections: { id: string; title: string; slug: string }[]
  totalCount: number
}

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

const vocabulary = Array.from(
  new Set([
    ...products.flatMap((product) => words(`${product.title} ${Object.values(product.variants[0]?.options ?? {}).join(" ")}`)),
    ...collections.flatMap((collection) => words(collection.title)),
    ...Object.keys(SYNONYM_MAP),
  ]),
).filter((word) => word.length > 2)

export async function searchCatalog(rawQuery: string): Promise<SearchResponse> {
  try {
    const dbSearch = await dalSearchCatalog(rawQuery)
    if (dbSearch && (dbSearch.products.length > 0 || dbSearch.collections.length > 0 || dbSearch.categories.length > 0)) {
      return dbSearch
    }
  } catch (error) {
    console.error("[catalog] DB searchCatalog failed, using fallback:", error)
  }

  const query = rawQuery.trim()
  const terms = words(query)
  const empty: SearchResponse = { query, suggestion: null, hasExactMatch: false, products: [], categories: [], collections: [], totalCount: 0 }
  if (terms.length === 0) return empty

  // Each term also matches its synonyms and, for typos, the closest catalogue word.
  let corrected = false
  const expanded = terms.map((term) => {
    const options = new Set([term, ...(SYNONYM_MAP[term] ?? [])])
    if (!vocabulary.some((word) => word.includes(term)) && term.length > 3) {
      const close = vocabulary
        .map((word) => ({ word, distance: damerauLevenshteinDistance(term, word) }))
        .filter((item) => item.distance <= (term.length > 6 ? 2 : 1))
        .sort((a, b) => a.distance - b.distance)[0]
      if (close) {
        options.add(close.word)
        corrected = true
      }
    }
    return [...options]
  })

  const scored = products
    .map((product) => {
      const category = categoryOf(product)
      const haystack = `${product.title} ${category?.name ?? ""} ${product.collections.join(" ")} ${product.description}`.toLowerCase()
      const title = product.title.toLowerCase()
      let score = 0
      for (const options of expanded) {
        const inTitle = options.some((option) => title.includes(option))
        const anywhere = inTitle || options.some((option) => haystack.includes(option))
        if (!anywhere) return null
        score += inTitle ? 3 : 1
      }
      return { product, score }
    })
    .filter((item): item is { product: CatalogProduct; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)

  const results: SearchProductResult[] = scored.slice(0, 24).map(({ product, score }) => {
    const card = toCard(product)
    return {
      id: card.id,
      title: card.title,
      slug: card.slug,
      categoryName: card.category?.name ?? null,
      price: card.price ?? "",
      compareAtPrice: card.compareAtPrice ?? null,
      image: card.image,
      alt: card.alt,
      isInStock: card.isInStock,
      score,
    }
  })

  const matchingCollections = collections
    .filter((collection) => expanded.every((options) => options.some((option) => collection.title.toLowerCase().includes(option))))
    .map((collection) => ({ id: collection.handle, title: collection.title, slug: collection.handle }))

  return {
    query,
    suggestion: corrected ? expanded.map((options) => options[options.length - 1]).join(" ") : null,
    hasExactMatch: !corrected && results.length > 0,
    products: results,
    categories: matchingCollections.map((collection) => ({ id: collection.id, name: collection.title, slug: collection.slug })),
    collections: matchingCollections,
    totalCount: scored.length,
  }
}
