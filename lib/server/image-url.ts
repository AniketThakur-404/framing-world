import "server-only"

/** Resolve a stored product image object key to a public URL. */
export function productImageUrl(objectKey: string | null | undefined) {
  if (!objectKey) return null

  if (objectKey.startsWith("/")) {
    return objectKey
  }

  if (objectKey.startsWith("uploads/")) {
    return `/${objectKey}`
  }

  const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "")
  return baseUrl ? `${baseUrl}/${objectKey}` : null
}
