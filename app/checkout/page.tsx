import type { Metadata } from "next"

import { WhatsAppCheckout } from "@/components/cart/WhatsAppCheckout"

export const metadata: Metadata = {
  title: "Checkout | Framing World",
  description: "Complete your Framing World order.",
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return <WhatsAppCheckout />
}
