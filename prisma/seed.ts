import "dotenv/config"

import { readFileSync } from "node:fs"
import path from "node:path"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

/**
 * Imports the Framing World catalogue (products, variants, images, categories
 * and collections) taken from framingworld.in.
 *
 *   npm run db:seed
 *
 * Source data: content/framingworld/catalog/*.json. Images are already in
 * public/images/catalog. Products and collections that exist (matched by
 * slug) are left untouched, so the script is safe to run again and never
 * overwrites edits made in the dashboard.
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
  images: { src: string; alt: string }[]
  variants: CatalogVariant[]
}

type CatalogCollection = {
  handle: string
  title: string
  description: string
  productHandles: string[]
}

/** Units given to every variant that is available on the live store (frames are made to order). */
const AVAILABLE_STOCK = 100

/** Cover photos for the main collections; the rest use their first product photo. */
const COLLECTION_IMAGES: Record<string, string> = {
  "wall-gallery": "/images/home/tile-frame-wall-gallery.jpg",
  "imported-wooden-frames": "/images/home/hero-2.webp",
  "best-selling-frames": "/images/home/tile-best-selling-frames.jpg",
  "fine-art-prints": "/images/home/home-consultation.jpg",
  molding: "/images/home/hero-1.jpg",
}

/** Shopify system collections that are not worth a page here. */
const SKIPPED_COLLECTIONS = new Set(["frontpage"])

function readCatalog<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), "content", "framingworld", "catalog", file), "utf8")) as T
}

function skuFor(handle: string, index: number) {
  const base = handle.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  return `FW-${base}-${String(index + 1).padStart(3, "0")}`
}

/**
 * How the storefront reads a variant (see lib/product-options.ts): `Size` is
 * the label that identifies it in the cart, `Options` keeps each value.
 */
function optionValuesFor(variant: CatalogVariant) {
  const values = Object.values(variant.options)
  if (values.length === 0) return undefined
  return { Size: values.join(" / "), Options: variant.options }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.")
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

  try {
    const products = readCatalog<CatalogProduct[]>("products.json")
    const collections = readCatalog<CatalogCollection[]>("collections.json")
    const collectionByHandle = new Map(collections.map((collection) => [collection.handle, collection]))

    console.log(`Importing ${products.length} products and ${collections.length} collections...`)

    // 1. Categories: one per collection that products are filed under.
    const categoryIds = new Map<string, string>()
    const categoryHandles = [...new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))]
    for (const handle of categoryHandles) {
      const source = collectionByHandle.get(handle)
      const category = await prisma.category.upsert({
        where: { slug: handle },
        update: {},
        create: {
          name: source?.title ?? handle,
          slug: handle,
          description: source?.description || null,
          status: "ACTIVE",
          visible: true,
        },
      })
      categoryIds.set(handle, category.id)
    }

    // 2. Products with their images and variants.
    let created = 0
    let skipped = 0
    let variantCount = 0
    for (const product of products) {
      const existing = await prisma.product.findUnique({ where: { slug: product.handle }, select: { id: true } })
      if (existing) {
        skipped += 1
        continue
      }

      // The storefront lists newest first and treats the first variant as the
      // "from" price, so both keep the order they have on the live store.
      const publishedAt = new Date(product.publishedAt)
      const createdAt = Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt

      await prisma.$transaction(
        async (tx) => {
          const row = await tx.product.create({
            data: {
              title: product.title,
              slug: product.handle,
              description: product.description || null,
              vendor: "Framing World",
              status: "ACTIVE",
              categoryId: product.category ? (categoryIds.get(product.category) ?? null) : null,
              tags: product.tags,
              createdAt,
              images: {
                create: product.images.map((image, position) => ({
                  objectKey: image.src,
                  altText: image.alt || product.title,
                  position,
                })),
              },
            },
            select: { id: true },
          })

          await tx.productVariant.createMany({
            data: product.variants.map((variant, index) => ({
              productId: row.id,
              title: variant.title,
              sku: skuFor(product.handle, index),
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              inventoryQuantity: variant.available ? AVAILABLE_STOCK : 0,
              optionValues: optionValuesFor(variant),
              createdAt: new Date(createdAt.getTime() + index),
            })),
          })
        },
        { timeout: 60_000 },
      )

      created += 1
      variantCount += product.variants.length
      if (created % 25 === 0) console.log(`  ${created} products...`)
    }
    console.log(`Products: ${created} created (${variantCount} variants), ${skipped} already existed.`)

    // 3. Collections, with their products in the live store's order.
    const productIds = new Map(
      (await prisma.product.findMany({ select: { id: true, slug: true } })).map((row) => [row.slug, row.id]),
    )
    const firstImage = new Map(products.map((product) => [product.handle, product.images[0]?.src ?? null]))

    let collectionsCreated = 0
    for (const collection of collections) {
      if (SKIPPED_COLLECTIONS.has(collection.handle) || collection.productHandles.length === 0) continue

      const existing = await prisma.collection.findUnique({ where: { slug: collection.handle }, select: { id: true } })
      if (existing) continue

      const members = collection.productHandles
        .map((handle) => productIds.get(handle))
        .filter((id): id is string => Boolean(id))
      const cover =
        COLLECTION_IMAGES[collection.handle] ??
        collection.productHandles.map((handle) => firstImage.get(handle)).find((src) => Boolean(src)) ??
        null

      await prisma.collection.create({
        data: {
          title: collection.title,
          slug: collection.handle,
          description: collection.description || null,
          isPublished: true,
          imageObjectKey: cover,
          imageAltText: collection.title,
          products: {
            create: members.map((productId, position) => ({ productId, position })),
          },
        },
      })
      collectionsCreated += 1
    }
    console.log(`Collections: ${collectionsCreated} created.`)
    console.log("Done.")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
