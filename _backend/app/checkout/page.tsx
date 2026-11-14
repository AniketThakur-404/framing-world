import type { Metadata } from "next"

import { CheckoutPage } from "@/components/cart/CheckoutPage"

export const metadata: Metadata = {
  title: "Checkout | Framing World",
  description: "Complete your Framing World order. Enter your shipping details and payment information.",
}

export default function Page() {
  return <CheckoutPage />
}
