import type { Metadata } from "next"

import { ShoppingBagPage } from "@/components/cart/ShoppingBagPage"

export const metadata: Metadata = {
  title: "Shopping Bag | Framing World",
  description: "Review and manage your Framing World shopping bag before checkout.",
}

export default function CartPage() {
  return <ShoppingBagPage />
}
