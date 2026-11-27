import "server-only"

import { Prisma } from "@/generated/prisma/client"
import { assertPermission } from "@/lib/server/dal/auth"
import { getPrisma } from "@/lib/server/db"
import {
  productInputSchema,
  type ProductInput,
} from "@/lib/validations/product"
import { attachProductImageSchema } from "@/lib/validations/upload"

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180)
}

async function createAvailableSlug(
  requestedSlug: string,
  excludingProductId?: string,
) {
  const prisma = getPrisma()
  const baseSlug = slugify(requestedSlug) || "product"
  const matchingSlugs = await prisma.product.findMany({
    where: {
      AND: [
        { OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }] },
        ...(excludingProductId ? [{ id: { not: excludingProductId } }] : []),
      ],
    },
    select: { slug: true },
  })

  const usedSlugs = new Set(matchingSlugs.map((product) => product.slug))

  if (!usedSlugs.has(baseSlug)) {
    return baseSlug
  }

  let suffix = 2
  while (usedSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1
  }

  return `${baseSlug}-${suffix}`
}

function skuify(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56) || "FW"
}

async function createAvailableSku(
  requestedSku: string,
  suffix: number,
) {
  const prisma = getPrisma()
  const baseSku = skuify(requestedSku)
  const candidate = suffix === 1 ? baseSku : `${baseSku}-${suffix}`
  const matchingSkus = await prisma.productVariant.findMany({
    where: { sku: { startsWith: candidate } },
    select: { sku: true },
  })
  const usedSkus = new Set(matchingSkus.map((variant) => variant.sku))

  if (!usedSkus.has(candidate)) {
    return candidate
  }

  let collision = 2
  while (usedSkus.has(`${candidate}-${collision}`)) {
    collision += 1
  }

  return `${candidate}-${collision}`
}

export async function createProduct(input: ProductInput) {
  await assertPermission("products.manage")
  const prisma = getPrisma()
  const product = productInputSchema.parse(input)
  const slug = await createAvailableSlug(product.slug ?? product.title)

  if (product.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: product.categoryId },
      select: { id: true },
    })
    if (!category) {
      throw new Error("The selected category no longer exists.")
    }
  }

  if (product.collectionIds.length > 0) {
    const collectionCount = await prisma.collection.count({
      where: { id: { in: product.collectionIds } },
    })
    if (collectionCount !== product.collectionIds.length) {
      throw new Error("One or more selected collections no longer exist.")
    }
  }

  const requestedVariants = product.variants.length > 0
    ? product.variants
    : [{
        title: "Default",
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        inventoryQuantity: product.inventoryQuantity,
        optionValues: {},
      }]

  const variants = await Promise.all(
    requestedVariants.map(async (variant, index) => ({
      ...variant,
      sku: await createAvailableSku(
        variant.sku || product.sku || `FW-${slug}`,
        index + 1,
      ),
    })),
  )

  return prisma.product.create({
    data: {
      title: product.title,
      slug,
      description: product.description || null,
      status: product.status,
      categoryId: product.categoryId || null,
      tags: product.tags,
      taxRate: new Prisma.Decimal(product.taxRate ?? 12),
      hsnCode: product.hsnCode || "6203",
      isTaxExempt: product.isTaxExempt ?? false,
      details: product.details.length > 0
        ? (product.details as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      pageContent: product.pageContent
        ? (product.pageContent as Prisma.InputJsonValue)
        : undefined,
      collections: product.collectionIds.length > 0
        ? {
            create: product.collectionIds.map((collectionId, position) => ({
              collectionId,
              position,
            })),
          }
        : undefined,
      images: product.images.length > 0
        ? {
            create: product.images.map((objectKey, position) => ({
              objectKey,
              position,
              altText: product.imageAltTexts?.[objectKey] || null,
            })),
          }
        : undefined,
      variants: {
        create: variants.map((variant) => ({
          title: variant.title,
          sku: variant.sku,
          price: new Prisma.Decimal(variant.price.toFixed(2)),
          compareAtPrice:
            variant.compareAtPrice === null
              ? null
              : new Prisma.Decimal(variant.compareAtPrice.toFixed(2)),
          inventoryQuantity: variant.inventoryQuantity,
          optionValues:
            Object.keys(variant.optionValues).length > 0
              ? (variant.optionValues as Prisma.InputJsonValue)
              : Prisma.JsonNull,
        })),
      },
    },
    select: {
      id: true,
      slug: true,
    },
  })
}

export async function updateProduct(productId: string, input: ProductInput) {
  await assertPermission("products.manage")
  const prisma = getPrisma()
  const product = productInputSchema.parse(input)
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      variants: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          sku: true,
          title: true,
          price: true,
          compareAtPrice: true,
          inventoryQuantity: true,
          optionValues: true,
        },
      },
      images: { select: { objectKey: true } },
    },
  })

  if (!existing) {
    throw new Error("Product not found")
  }

  if (product.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: product.categoryId },
      select: { id: true },
    })
    if (!category) {
      throw new Error("The selected category no longer exists.")
    }
  }

  if (product.collectionIds.length > 0) {
    const collectionCount = await prisma.collection.count({
      where: { id: { in: product.collectionIds } },
    })
    if (collectionCount !== product.collectionIds.length) {
      throw new Error("One or more selected collections no longer exist.")
    }
  }

  const slug = await createAvailableSlug(product.slug ?? product.title, productId)
  const requestedVariants = product.variants.length > 0
    ? product.variants
    : existing.variants.length > 0
      ? existing.variants.map((v) => ({
          title: v.title,
          sku: v.sku,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice !== null ? Number(v.compareAtPrice) : null,
          inventoryQuantity: v.inventoryQuantity,
          optionValues: (v.optionValues && typeof v.optionValues === "object" ? v.optionValues : {}) as Record<string, any>,
        }))
      : [{
          title: "Default",
          sku: product.sku,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          inventoryQuantity: product.inventoryQuantity,
          optionValues: {},
        }]

  if (requestedVariants.length > 0 && product.price > 0) {
    requestedVariants[0].price = product.price
    if (product.compareAtPrice !== undefined) {
      requestedVariants[0].compareAtPrice = product.compareAtPrice
    }
    if (product.inventoryQuantity !== undefined) {
      requestedVariants[0].inventoryQuantity = product.inventoryQuantity
    }
    if (product.sku) {
      requestedVariants[0].sku = product.sku
    }
  }

  const existingSkuSet = new Set(existing.variants.map((v) => v.sku))
  const variants: Array<
    Omit<ProductInput["variants"][number], "sku"> & { sku: string }
  > = []

  const candidatesToCheck: { index: number; candidate: string }[] = []
  for (const [index, variant] of requestedVariants.entries()) {
    const existingVariant = existing.variants[index]
    const requestedSku = variant.sku || existingVariant?.sku || product.sku || `FW-${slug}`
    if (existingVariant?.sku === requestedSku || existingSkuSet.has(requestedSku)) {
      variants.push({ ...variant, sku: requestedSku })
    } else {
      const baseSku = skuify(requestedSku)
      const candidate = (index + 1) === 1 ? baseSku : `${baseSku}-${index + 1}`
      candidatesToCheck.push({ index, candidate })
      variants.push({ ...variant, sku: candidate })
    }
  }

  if (candidatesToCheck.length > 0) {
    const matchingSkus = await prisma.productVariant.findMany({
      where: {
        sku: { in: candidatesToCheck.map((c) => c.candidate) },
        NOT: { productId },
      },
      select: { sku: true },
    })
    const usedSkus = new Set(matchingSkus.map((v) => v.sku))
    for (const item of candidatesToCheck) {
      let finalSku = item.candidate
      let collision = 2
      while (usedSkus.has(finalSku)) {
        finalSku = `${item.candidate}-${collision}`
        collision += 1
      }
      usedSkus.add(finalSku)
      variants[item.index].sku = finalSku
    }
  }

  const existingImageKeys = new Set(
    existing.images.map((image) => image.objectKey),
  )

  return prisma.$transaction(async (transaction) => {
    const updated = await transaction.product.update({
      where: { id: productId },
      data: {
        title: product.title,
        slug,
        description: product.description || null,
        status: product.status,
        categoryId: product.categoryId || null,
        tags: product.tags,
        taxRate: new Prisma.Decimal(product.taxRate ?? 12),
        hsnCode: product.hsnCode || "6203",
        isTaxExempt: product.isTaxExempt ?? false,
        details: product.details.length > 0
          ? (product.details as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        pageContent: product.pageContent
          ? (product.pageContent as Prisma.InputJsonValue)
          : undefined,
        collections: {
          deleteMany: {},
          create: product.collectionIds.map((collectionId, position) => ({
            collectionId,
            position,
          })),
        },
      },
      select: { id: true, slug: true },
    })

    await transaction.productImage.deleteMany({
      where: {
        productId,
        objectKey: { notIn: product.images },
      },
    })

    await Promise.all(
      product.images.map((objectKey, position) =>
        existingImageKeys.has(objectKey)
          ? transaction.productImage.update({
              where: { objectKey },
              data: {
                position,
                ...(product.imageAltTexts && objectKey in product.imageAltTexts
                  ? { altText: product.imageAltTexts[objectKey] || null }
                  : {}),
              },
            })
          : transaction.productImage.upsert({
              where: { objectKey },
              create: { productId, objectKey, position, altText: product.imageAltTexts?.[objectKey] || null },
              update: { productId, position, altText: product.imageAltTexts?.[objectKey] || null },
            }),
      ),
    )

    const variantPromises: Promise<any>[] = []
    for (const [index, variant] of variants.entries()) {
      const existingVariant = existing.variants[index] as any
      const data = {
        title: variant.title,
        sku: variant.sku,
        price: new Prisma.Decimal(variant.price.toFixed(2)),
        compareAtPrice:
          variant.compareAtPrice === null
            ? null
            : new Prisma.Decimal(variant.compareAtPrice.toFixed(2)),
        inventoryQuantity: variant.inventoryQuantity,
        optionValues:
          Object.keys(variant.optionValues).length > 0
            ? (variant.optionValues as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      }

      if (!existingVariant) {
        variantPromises.push(transaction.productVariant.create({ data: { productId, ...data } }))
      } else {
        const isChanged =
          existingVariant.title !== variant.title ||
          existingVariant.sku !== variant.sku ||
          Number(existingVariant.price) !== Number(variant.price) ||
          Number(existingVariant.compareAtPrice ?? null) !== Number(variant.compareAtPrice ?? null) ||
          existingVariant.inventoryQuantity !== variant.inventoryQuantity ||
          JSON.stringify(existingVariant.optionValues ?? {}) !== JSON.stringify(variant.optionValues ?? {})

        if (isChanged) {
          variantPromises.push(transaction.productVariant.update({ where: { id: existingVariant.id }, data }))
        }
      }
    }

    await Promise.all(variantPromises)

    if (product.variants.length > 0 && variants.length < existing.variants.length) {
      const removedVariantIds = existing.variants
        .slice(variants.length)
        .map((variant) => variant.id)
      if (removedVariantIds.length > 0) {
        await transaction.productVariant.deleteMany({
          where: { id: { in: removedVariantIds } },
        })
      }
    }

    return updated
  }, { maxWait: 20000, timeout: 60000 })
}

export async function deleteProducts(productIds: string[]) {
  await assertPermission("products.delete")
  const prisma = getPrisma()

  return prisma.product.deleteMany({
    where: { id: { in: productIds } },
  })
}

export async function updateProductsStatus(
  productIds: string[],
  status: "DRAFT" | "ACTIVE" | "ARCHIVED",
) {
  await assertPermission("products.manage")
  const prisma = getPrisma()

  return prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: { status },
  })
}

export async function attachProductImage(input: unknown) {
  await assertPermission("products.manage")
  const prisma = getPrisma()
  const image = attachProductImageSchema.parse(input)

  const lastImage = await prisma.productImage.findFirst({
    where: { productId: image.productId },
    orderBy: { position: "desc" },
    select: { position: true },
  })

  return prisma.productImage.create({
    data: {
      productId: image.productId,
      objectKey: image.objectKey,
      altText: image.altText || null,
      position: (lastImage?.position ?? -1) + 1,
    },
    select: {
      id: true,
      objectKey: true,
      position: true,
    },
  })
}

/**
 * Copies a product into a new Draft: details, page content, variants (new
 * SKUs), category and collections. Photos are not copied: each image row is
 * tied to one product, and a duplicate is usually a new colour anyway.
 */
export async function duplicateProduct(productId: string) {
  await assertPermission("products.manage")
  const prisma = getPrisma()
  const source = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: { orderBy: { createdAt: "asc" } },
      collections: { orderBy: { position: "asc" } },
    },
  })
  if (!source) throw new Error("Product not found")

  const title = `${source.title} (COPY)`.slice(0, 160)
  const slug = await createAvailableSlug(`${source.slug}-copy`)
  const variants = []
  for (const [index, variant] of source.variants.entries()) {
    variants.push({
      title: variant.title,
      sku: await createAvailableSku(`${variant.sku}-COPY`, index + 1),
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      inventoryQuantity: 0,
      optionValues: variant.optionValues ?? Prisma.JsonNull,
    })
  }

  return prisma.product.create({
    data: {
      title,
      slug,
      description: source.description,
      vendor: source.vendor,
      status: "DRAFT",
      categoryId: source.categoryId,
      tags: source.tags,
      details: source.details ?? Prisma.JsonNull,
      // Image picks point at the source's photos, so clear them.
      pageContent: source.pageContent
        ? ({
            ...(source.pageContent as Record<string, unknown>),
            highlights: [],
            lifestyleImageKey: "",
            hoverImageKey: "",
            imageRoles: {},
          } as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      taxRate: source.taxRate,
      hsnCode: source.hsnCode,
      isTaxExempt: source.isTaxExempt,
      collections: {
        create: source.collections.map(({ collectionId }, position) => ({ collectionId, position })),
      },
      variants: { create: variants },
    },
    select: { id: true, slug: true },
  })
}
