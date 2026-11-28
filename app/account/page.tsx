import type { Metadata } from "next"

import { requireUser } from "@/lib/server/dal/auth"
import { getPrisma } from "@/lib/server/db"
import { productImageUrl } from "@/lib/server/image-url"
import { AccountDashboard, type CustomerOrder } from "@/components/account/AccountDashboard"

export const metadata: Metadata = {
  title: "My Account | Framing World",
  description: "View your order history, delivery details, and account settings.",
}

export default async function AccountPage() {
  const user = await requireUser()
  const prisma = getPrisma()

  // Match orders by either explicit userId or guest email matching customer email
  const rawOrders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        { email: { equals: user.email, mode: "insensitive" } },
      ],
    },
    include: {
      items: {
        include: {
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
    orderBy: {
      createdAt: "desc",
    },
  })

  const orders: CustomerOrder[] = rawOrders.map((o) => ({
    id: o.id,
    number: o.number,
    reference: `FW-${String(o.number).padStart(5, "0")}`,
    status: o.status,
    total: Number(o.total),
    discount: Number(o.discount),
    shipping: Number(o.shipping),
    discountCode: o.discountCode,
    paymentMethod: o.paymentMethod,
    shippingMethod: o.shippingMethod,
    shippingAddress: (o.shippingAddress as CustomerOrder["shippingAddress"]) ?? null,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((it) => {
      const image = it.variant?.product.images[0]
      return {
        id: it.id,
        title: it.title,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        total: Number(it.total),
        image: productImageUrl(image?.objectKey),
        imageAlt: image?.altText || it.variant?.product.title || it.title,
      }
    }),
  }))

  return (
    <AccountDashboard
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        phone: user.phone,
      }}
      orders={orders}
    />
  )
}
