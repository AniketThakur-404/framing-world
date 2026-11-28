import type { Metadata } from "next"
import { connection } from "next/server"

import { CheckoutPage } from "@/components/CheckoutPage"
import { getRazorpayEnv } from "@/lib/server/env"

export const metadata: Metadata = {
  title: "Checkout | Framing World",
  description: "Complete your Framing World order.",
  robots: { index: false, follow: false },
}

export default async function Checkout() {
  // Read the payment config per request, not at build time. Online payment is
  // offered only when Razorpay is configured; otherwise shoppers can still
  // place a Cash on Delivery order.
  await connection()
  const env = getRazorpayEnv()
  const onlinePaymentEnabled = Boolean(
    (env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID) && env.RAZORPAY_KEY_SECRET,
  )

  return <CheckoutPage onlinePaymentEnabled={onlinePaymentEnabled} />
}
