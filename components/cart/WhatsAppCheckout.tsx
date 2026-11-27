"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { useCart } from "@/lib/cart-context"
import { validatePhoneNumber, validatePinCode } from "@/lib/validations/checkout"

/** Number that receives orders. */
const WHATSAPP_NUMBER = "919810828566"

const priceValue = (price: string | null | undefined) => Number((price ?? "").replace(/[^\d.]/g, "")) || 0
const formatRupees = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

/**
 * Checkout without a payment server: the order (items, options, quantities,
 * delivery details) is sent as a WhatsApp message, and payment is arranged
 * with the shop.
 */
export function WhatsAppCheckout() {
  const { cart, clearCart } = useCart()
  const [details, setDetails] = useState({ name: "", phone: "", address: "", city: "", pincode: "", note: "" })
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; pincode?: string }>({})
  const [error, setError] = useState("")

  const subtotal = cart.reduce((sum, item) => sum + priceValue(item.price) * item.quantity, 0)

  const set = (key: keyof typeof details) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = event.target.value
    if (key === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10)
    } else if (key === "pincode") {
      value = value.replace(/\D/g, "").slice(0, 6)
    }
    setDetails((prev) => ({ ...prev, [key]: value }))
    if (error) setError("")
    if (fieldErrors[key as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const sendOrder = (event: React.FormEvent) => {
    event.preventDefault()

    const phoneValidation = validatePhoneNumber(details.phone)
    const pinValidation = validatePinCode(details.pincode)

    if (!details.name.trim() || !details.address.trim()) {
      const newErrors: { phone?: string; pincode?: string } = {}
      if (!phoneValidation.isValid && phoneValidation.error) {
        newErrors.phone = phoneValidation.error
      }
      if (!pinValidation.isValid && pinValidation.error) {
        newErrors.pincode = pinValidation.error
      }
      setFieldErrors(newErrors)
      setError("Please fill in your name, phone number and delivery address.")
      return
    }

    if (!phoneValidation.isValid || !pinValidation.isValid) {
      const newErrors: { phone?: string; pincode?: string } = {}
      const messages: string[] = []
      if (!phoneValidation.isValid && phoneValidation.error) {
        newErrors.phone = phoneValidation.error
        messages.push(phoneValidation.error)
      }
      if (!pinValidation.isValid && pinValidation.error) {
        newErrors.pincode = pinValidation.error
        messages.push(pinValidation.error)
      }
      setFieldErrors(newErrors)
      setError(messages.join(" "))
      return
    }

    setFieldErrors({})
    setError("")
    const lines = [
      "Hello Framing World, I would like to place an order:",
      "",
      ...cart.map(
        (item, index) =>
          `${index + 1}. ${item.title}${item.size ? ` (${item.size})` : ""} x ${item.quantity} = ${formatRupees(priceValue(item.price) * item.quantity)}`,
      ),
      "",
      `Subtotal: ${formatRupees(subtotal)}`,
      "",
      `Name: ${details.name.trim()}`,
      `Phone: ${details.phone.trim()}`,
      `Address: ${details.address.trim()}, ${details.city.trim()} ${details.pincode.trim()}`.trim(),
      ...(details.note.trim() ? [`Note: ${details.note.trim()}`] : []),
    ]
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener")
    clearCart()
  }

  if (cart.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-24 text-center text-black">
        <h1 className="type-title">Your bag is empty</h1>
        <Link href="/shop" className="mt-8 inline-flex h-11 items-center bg-brand-cta px-8 text-[13px] font-medium uppercase tracking-[0.2em] text-white hover:bg-brand-terracotta">
          Shop now
        </Link>
      </main>
    )
  }

  const field = "w-full border-b border-black/30 bg-transparent py-3 text-[15px] text-black outline-none placeholder:text-black/45 focus:border-black"

  return (
    <main className="flex-1 bg-white text-black">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 lg:py-16">
        <form onSubmit={sendOrder} className="space-y-8" noValidate>
          <div>
            <h1 className="type-title">Checkout</h1>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-600">
              Your order is sent to us on WhatsApp. We confirm sizes, delivery and payment with you there.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <input className={field} placeholder="Full name *" value={details.name} onChange={set("name")} autoComplete="name" />
            </div>
            <div>
              <input
                className={`${field} ${fieldErrors.phone ? "border-destructive focus:border-destructive" : ""}`}
                placeholder="Phone number *"
                value={details.phone}
                onChange={set("phone")}
                autoComplete="tel"
                inputMode="numeric"
                type="tel"
                maxLength={10}
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone ? (
                <p role="alert" className="mt-1.5 text-[13px] text-destructive">
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>
          </div>
          <input className={field} placeholder="Delivery address *" value={details.address} onChange={set("address")} autoComplete="street-address" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <input className={field} placeholder="City" value={details.city} onChange={set("city")} autoComplete="address-level2" />
            </div>
            <div>
              <input
                className={`${field} ${fieldErrors.pincode ? "border-destructive focus:border-destructive" : ""}`}
                placeholder="PIN code"
                value={details.pincode}
                onChange={set("pincode")}
                autoComplete="postal-code"
                inputMode="numeric"
                type="text"
                maxLength={6}
                aria-invalid={Boolean(fieldErrors.pincode)}
              />
              {fieldErrors.pincode ? (
                <p role="alert" className="mt-1.5 text-[13px] text-destructive">
                  {fieldErrors.pincode}
                </p>
              ) : null}
            </div>
          </div>
          <textarea className={`${field} resize-none`} rows={3} placeholder="Note (custom size, framing instructions…)" value={details.note} onChange={set("note")} />
          {error ? <p role="alert" className="text-[14px] text-destructive">{error}</p> : null}
          <button type="submit" className="flex h-12 w-full items-center justify-center bg-brand-cta text-[13px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-terracotta">
            Send order on WhatsApp
          </button>
        </form>

        <aside className="h-fit bg-brand-cream p-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-600">Order summary</h2>
          <ul className="mt-5 divide-y divide-brand-sand">
            {cart.map((item) => (
              <li key={`${item.id}-${item.size}`} className="flex gap-4 py-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-white">
                  {item.image ? <Image src={item.image} alt={item.alt || item.title || ""} fill sizes="64px" className="object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1 text-[14px]">
                  <p className="font-medium text-black">{item.title}</p>
                  {item.size ? <p className="mt-1 text-ink-600">{item.size}</p> : null}
                  <p className="mt-1 text-ink-600">Qty {item.quantity}</p>
                </div>
                <p className="text-[14px] text-black">{formatRupees(priceValue(item.price) * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-brand-sand pt-4 text-[16px] font-medium">
            <span>Subtotal</span>
            <span>{formatRupees(subtotal)}</span>
          </div>
          <p className="mt-2 text-[13px] text-ink-600">Delivery charges are confirmed on WhatsApp.</p>
        </aside>
      </div>
    </main>
  )
}
