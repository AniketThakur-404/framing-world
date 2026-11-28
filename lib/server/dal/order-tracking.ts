import "server-only"

import { getPrisma } from "@/lib/server/db"
import { productImageUrl } from "@/lib/server/image-url"
import type { TrackOrderLookup } from "@/lib/validations/contact"

export type TrackedOrder = {
  reference: string
  status: "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED"
  statusLabel: string
  statusDetail: string
  placedAt: string
  total: number
  currency: string
  subtotal: number
  shipping: number
  discount: number
  paymentMethod: string | null
  itemCount: number
  items: Array<{
    title: string
    quantity: number
    total: number
    image: string | null
    imageAlt: string
  }>
  shippingMethod: string | null
  city: string | null
  shippingAddress: {
    name: string | null
    line: string
  } | null
}

function str(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

const STATUS_COPY: Record<TrackedOrder["status"], { label: string; detail: string }> = {
  PENDING: {
    label: "Order received",
    detail: "We have your order and are confirming payment.",
  },
  CONFIRMED: {
    label: "Being prepared",
    detail: "Payment confirmed. Your pieces are being packed in our studio.",
  },
  FULFILLED: {
    label: "Shipped",
    detail: "Your order is on its way. Delivery usually takes 2 to 4 business days.",
  },
  CANCELLED: {
    label: "Cancelled",
    detail: "This order was cancelled. Any payment will be refunded to the original method.",
  },
}

/**
 * Public, unauthenticated lookup. The email (and optional PIN code) act as
 * the shared secret, so nothing is returned unless both match.
 */
export async function findOrderForTracking(lookup: TrackOrderLookup): Promise<TrackedOrder | null> {
  const number = Number.parseInt(lookup.order, 10)
  if (!Number.isFinite(number) || number <= 0) return null

  const order = await getPrisma().order.findFirst({
    where: { number, email: { equals: lookup.email, mode: "insensitive" } },
    select: {
      number: true,
      status: true,
      total: true,
      shipping: true,
      discount: true,
      paymentMethod: true,
      currency: true,
      createdAt: true,
      shippingMethod: true,
      shippingAddress: true,
      items: {
        select: {
          title: true,
          quantity: true,
          total: true,
          variant: {
            select: {
              product: {
                select: {
                  title: true,
                  images: {
                    select: { objectKey: true, altText: true },
                    orderBy: { position: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!order) return null

  const address =
    order.shippingAddress && typeof order.shippingAddress === "object" && !Array.isArray(order.shippingAddress)
      ? (order.shippingAddress as Record<string, unknown>)
      : null
  const postalCode = typeof address?.postalCode === "string" ? address.postalCode : null

  if (lookup.postcode && postalCode && lookup.postcode.replace(/\s/g, "") !== postalCode.replace(/\s/g, "")) {
    return null
  }

  const copy = STATUS_COPY[order.status]

  const items = order.items.map((item) => {
    const image = item.variant?.product.images[0]
    return {
      title: item.title,
      quantity: item.quantity,
      total: Number(item.total),
      image: productImageUrl(image?.objectKey),
      imageAlt: image?.altText || item.variant?.product.title || item.title,
    }
  })

  const addressLine = [
    str(address?.address1),
    str(address?.address2),
    str(address?.city),
    [str(address?.state), postalCode].filter(Boolean).join(" ") || null,
  ]
    .filter(Boolean)
    .join(", ")

  return {
    reference: `FW-${String(order.number).padStart(5, "0")}`,
    status: order.status,
    statusLabel: copy.label,
    statusDetail: copy.detail,
    placedAt: order.createdAt.toISOString(),
    total: Number(order.total),
    subtotal: items.reduce((sum, item) => sum + item.total, 0),
    shipping: Number(order.shipping),
    discount: Number(order.discount),
    paymentMethod: order.paymentMethod,
    currency: order.currency,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    shippingMethod: order.shippingMethod,
    city: str(address?.city),
    shippingAddress: address ? { name: str(address.name), line: addressLine } : null,
  }
}
