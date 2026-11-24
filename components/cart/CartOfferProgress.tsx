"use client"

import { Check } from "lucide-react"

import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

const offerMilestones = [
  { amount: 4500, label: "₹4,500", reward: "10% off", positionPercent: 16.67 },
  { amount: 12000, label: "₹12,000", reward: "15% off", positionPercent: 50 },
  { amount: 15000, label: "₹15,000", reward: "VIP privilege", positionPercent: 83.33 },
] as const

export function CartOfferProgress() {
  const { cart } = useCart()

  const subtotal = cart.reduce((acc, item) => {
    const raw = (item.price || "0").replace(/[^\d.]/g, "")
    const num = parseFloat(raw) || 0
    return acc + num * (item.quantity || 1)
  }, 0)

  // Calculate dynamic progress line width & message
  let fillPercent = 0
  let headlineText = ""

  if (subtotal <= 0) {
    fillPercent = 0
    headlineText = "SHOP FOR ₹4,500 TO GET 10% OFF"
  } else if (subtotal < 4500) {
    fillPercent = (subtotal / 4500) * 16.67
    const remaining = 4500 - subtotal
    headlineText = `SHOP FOR ₹${remaining.toLocaleString("en-IN")} TO GET 10% OFF`
  } else if (subtotal < 12000) {
    fillPercent = 16.67 + ((subtotal - 4500) / (12000 - 4500)) * (50 - 16.67)
    const remaining = 12000 - subtotal
    headlineText = `SHOP FOR ₹${remaining.toLocaleString("en-IN")} TO GET 15% OFF`
  } else if (subtotal < 15000) {
    fillPercent = 50 + ((subtotal - 12000) / (15000 - 12000)) * (83.33 - 50)
    const remaining = 15000 - subtotal
    headlineText = `SHOP FOR ₹${remaining.toLocaleString("en-IN")} FOR VIP PRIVILEGE`
  } else {
    fillPercent = 83.33
    headlineText = "You?ve unlocked all privileges!"
  }

  return (
    <section className="mx-auto w-full max-w-[420px] text-center">
      <h2 aria-live="polite" className="text-[13px] font-medium leading-5 text-white sm:text-[14px]">
        {headlineText}
      </h2>

      <div className="relative mt-6 h-[4.5rem]">
        <div className="absolute left-0 top-[0.875rem] h-0.5 w-[83.33%] rounded-full bg-white/20" />
        <div
          className="absolute left-0 top-[0.875rem] h-0.5 rounded-full bg-white transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${Math.min(83.33, fillPercent)}%` }}
        />

        {offerMilestones.map((item) => {
          const isReached = subtotal >= item.amount
          return (
            <div
              key={item.label}
              className="absolute top-[0.875rem] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${item.positionPercent}%` }}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full border border-white/60 transition-colors duration-300",
                  isReached ? "bg-white text-[#203c59]" : "bg-black"
                )}
              >
                {isReached ? <Check aria-hidden="true" className="size-3" strokeWidth={2.5} /> : null}
              </span>
              <span
                className={cn(
                  "absolute left-1/2 top-[1.45rem] -translate-x-1/2 whitespace-nowrap text-[11px] font-medium leading-4 transition-colors sm:text-[12px]",
                  isReached ? "text-white" : "text-white/75"
                )}
              >
                {item.label}
                <span className="mt-1 block text-[10px] font-normal text-white/60 sm:text-[11px]">{item.reward}</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
