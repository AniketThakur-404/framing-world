import type { Metadata } from "next"

import { WhatsAppCheckout } from "@/components/cart/WhatsAppCheckout"

export const metadata: Metadata = {
  title: "Checkout | Framing World",
  description: "Send your Framing World order on WhatsApp.",
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return <WhatsAppCheckout />
}
