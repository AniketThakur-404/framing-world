"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  attachProductImage,
  createProduct,
  duplicateProduct,
  deleteProducts,
  updateProduct,
  updateProductsStatus,
} from "@/lib/server/services/products"
import { permissionErrorMessage } from "@/lib/server/dal/auth"
import { productInputSchema } from "@/lib/validations/product"

export type ProductActionState =
  | { status: "idle" }
  | { status: "success"; productId: string }
  | { status: "error"; message: string; fields?: Record<string, string[]> }

function mutationError(error: unknown): string {
  const denied = permissionErrorMessage(error)
  if (denied) return denied
  if (error instanceof Error) {
    if (error.message === "Unauthorized") return "Sign in to continue."
    if (error.message === "Forbidden" || error.message === "SuperAdminRequired" || error.message.startsWith("PermissionDenied:")) {
      return "Administrator access is required."
    }
    if (error.message === "Product not found" || error.message.includes("no longer exist")) {
      return error.message
    }
    if (error.message.includes("P2028") || error.message.includes("timeout") || error.message.includes("Transaction")) {
      return "The database operation timed out. Please try again."
    }
    return error.message
  }
  return "The product could not be saved. Try again."
}

function revalidateProductPaths(productId?: string, slug?: string) {
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/collections")
  revalidatePath("/collections/[slug]", "page")
  revalidatePath("/products/[slug]", "page")
  if (slug) {
    revalidatePath(`/products/${slug}`)
  }
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/products/inventory")
  if (productId) {
    revalidatePath(`/dashboard/products/${productId}`)
  }
}

export async function createProductAction(
  input: unknown,
): Promise<ProductActionState> {
  const result = productInputSchema.safeParse(input)

  if (!result.success) {
    return {
      status: "error",
      message: "Check the highlighted product fields.",
      fields: z.flattenError(result.error).fieldErrors,
    }
  }

  try {
    const product = await createProduct(result.data)
    revalidateProductPaths(product.id, product.slug)

    return {
      status: "success",
      productId: product.id,
    }
  } catch (error) {
    console.error("[createProductAction] Error saving product:", error)
    return {
      status: "error",
      message: mutationError(error),
    }
  }
}

export async function updateProductAction(
  productId: string,
  input: unknown,
): Promise<ProductActionState> {
  const result = productInputSchema.safeParse(input)

  if (!result.success) {
    return {
      status: "error",
      message: "Check the highlighted product fields.",
      fields: z.flattenError(result.error).fieldErrors,
    }
  }

  try {
    const product = await updateProduct(productId, result.data)
    revalidateProductPaths(product.id, product.slug)

    return {
      status: "success",
      productId: product.id,
    }
  } catch (error) {
    console.error("[updateProductAction] Error updating product:", error)
    return {
      status: "error",
      message: mutationError(error),
    }
  }
}

export async function deleteProductsAction(productIds: unknown) {
  const ids = z.array(z.string().trim().min(1)).min(1).max(100).safeParse(productIds)

  if (!ids.success) {
    return { success: false, message: "Select at least one product." }
  }

  try {
    const deleted = await deleteProducts([...new Set(ids.data)])
    revalidateProductPaths()
    return { success: true, count: deleted.count }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, message: "Sign in to continue." }
    }
    if (error instanceof Error && (error.message === "Forbidden" || error.message === "SuperAdminRequired" || error.message.startsWith("PermissionDenied:"))) {
      return { success: false, message: "Administrator access is required." }
    }

    return { success: false, message: "The selected products could not be deleted." }
  }
}

export async function updateProductsStatusAction(
  productIds: unknown,
  status: unknown,
) {
  const ids = z.array(z.string().trim().min(1)).min(1).max(100).safeParse(productIds)
  const nextStatus = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).safeParse(status)

  if (!ids.success || !nextStatus.success) {
    return { success: false, message: "Select products and a valid status." }
  }

  try {
    const updated = await updateProductsStatus(
      [...new Set(ids.data)],
      nextStatus.data,
    )
    revalidateProductPaths()
    return { success: true, count: updated.count }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, message: "Sign in to continue." }
    }
    if (error instanceof Error && (error.message === "Forbidden" || error.message === "SuperAdminRequired" || error.message.startsWith("PermissionDenied:"))) {
      return { success: false, message: "Administrator access is required." }
    }

    return { success: false, message: "The selected products could not be updated." }
  }
}

export async function importProductsAction(input: unknown) {
  const products = z.array(productInputSchema).min(1).max(100).safeParse(input)

  if (!products.success) {
    return {
      success: false,
      message: "The CSV has one or more invalid products. Check title, price, stock, and status values.",
    }
  }

  try {
    for (const product of products.data) {
      await createProduct(product)
    }
    revalidateProductPaths()

    return { success: true, count: products.data.length }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, message: "Sign in to continue." }
    }
    if (error instanceof Error && (error.message === "Forbidden" || error.message === "SuperAdminRequired" || error.message.startsWith("PermissionDenied:"))) {
      return { success: false, message: "Administrator access is required." }
    }

    return { success: false, message: "The products could not be fully imported. Review the CSV and try again." }
  }
}

export async function attachProductImageAction(input: unknown) {
  const image = await attachProductImage(input)
  revalidatePath("/dashboard/products")

  return {
    success: true,
    imageId: image.id,
  }
}

export async function duplicateProductAction(productId: string) {
  const id = z.string().trim().min(1).safeParse(productId)
  if (!id.success) return { success: false as const, message: "Choose a product to duplicate." }
  try {
    const product = await duplicateProduct(id.data)
    revalidateProductPaths(product.id, product.slug)
    return { success: true as const, productId: product.id }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false as const, message: "Sign in to continue." }
    }
    if (error instanceof Error && (error.message === "Forbidden" || error.message.startsWith("PermissionDenied:"))) {
      return { success: false as const, message: "You don't have permission to add products." }
    }
    return { success: false as const, message: "The product could not be duplicated." }
  }
}
