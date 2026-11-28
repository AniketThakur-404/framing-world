import Image from "next/image"
import Link from "next/link"

import { trackOrderAction } from "@/app/actions/track-order"
import { resolvePage } from "@/lib/page-content"
import { findOrderForTracking, type TrackedOrder } from "@/lib/server/dal/order-tracking"
import { getSiteContent } from "@/lib/server/dal/site-content"
import { trackOrderLookupSchema } from "@/lib/validations/contact"

export const metadata = {
  title: "Track Your Order | Framing World",
  description: "Track your Framing World order status and shipment delivery in real-time.",
}

export const dynamic = "force-dynamic"

type TrackOrderSearchParams = {
  order?: string
  email?: string
  postcode?: string
  status?: string
}

async function resolveLookup(params: TrackOrderSearchParams) {
  if (params.status === "invalid") {
    return { message: "Enter your order number and the email used at checkout.", order: null }
  }
  if (!params.order || !params.email) {
    return { message: null, order: null }
  }
  const parsed = trackOrderLookupSchema.safeParse({
    order: params.order,
    email: params.email,
    postcode: params.postcode || undefined,
  })
  if (!parsed.success) {
    return { message: "Enter your order number and the email used at checkout.", order: null }
  }
  try {
    const order = await findOrderForTracking(parsed.data)
    return order
      ? { message: null, order }
      : { message: "We couldn’t find an order matching those details. Check the order number and email and try again.", order: null }
  } catch {
    return { message: "Order tracking is temporarily unavailable. Please try again shortly.", order: null }
  }
}

const TRACKING_STEPS = [
  { status: "PENDING", label: "Order received" },
  { status: "CONFIRMED", label: "Being prepared" },
  { status: "FULFILLED", label: "Shipped" },
] as const

function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}

function formatPayment(method: string | null) {
  if (!method) return "Prepaid"
  if (method === "FREE_PROMO") return "Promotional offer"
  if (method.toLowerCase() === "cod") return "Cash on delivery"
  return method
}

function OrderTrackingCard({ order }: { order: TrackedOrder }) {
  const isCancelled = order.status === "CANCELLED"
  const currentStep = TRACKING_STEPS.findIndex((step) => step.status === order.status)
  const placedOn = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <section aria-live="polite" className="mt-8 text-[14px] font-normal leading-[1.5] text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-black pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.06em] text-black/60">Order</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <p className="text-[22px] uppercase tracking-[0.04em] sm:text-[26px]">{order.reference}</p>
            <span
              className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.04em] ${
                isCancelled
                  ? "border-black/30 bg-neutral-100 text-black/50"
                  : order.status === "FULFILLED"
                    ? "border-black bg-black text-white"
                    : "border-black text-black"
              }`}
            >
              {order.statusLabel}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-black/60">Placed on {placedOn}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[12px] uppercase tracking-[0.06em] text-black/60">Order total</p>
          <p className="mt-1 text-[22px] sm:text-[26px]">{formatRupees(order.total)}</p>
        </div>
      </div>

      {/* Status */}
      <div className="border-b border-black/15 py-8">
        {isCancelled ? null : (
          <ol aria-label="Order progress" className="grid grid-cols-3">
            {TRACKING_STEPS.map((step, index) => {
              const done = index <= currentStep
              const isCurrent = index === currentStep
              return (
                <li
                  key={step.status}
                  aria-current={isCurrent ? "step" : undefined}
                  className="relative flex flex-col items-center text-center"
                >
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className={`absolute right-1/2 top-[11px] h-0.5 w-full ${
                        done ? "bg-black" : "bg-black/15"
                      }`}
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className={`relative z-10 flex size-6 items-center justify-center rounded-full border text-[11px] ${
                      done ? "border-black bg-black text-white" : "border-black/25 bg-white text-black/40"
                    } ${isCurrent ? "ring-4 ring-black/10" : ""}`}
                  >
                    {done && !isCurrent ? "✓" : index + 1}
                  </span>
                  <span
                    className={`mt-3 text-[11px] uppercase tracking-[0.04em] sm:text-[12px] ${
                      done ? "text-black" : "text-black/40"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
        <p className={`text-center text-[14px] text-black/70 ${isCancelled ? "" : "mt-6"}`}>
          {order.statusDetail}
        </p>
      </div>

      {/* Items + summary */}
      <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <h2 className="text-[13px] uppercase tracking-[0.04em]">
            Items ({order.itemCount})
          </h2>
          <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
            {order.items.map((item, index) => (
              <li key={`${item.title}-${index}`} className="flex items-center gap-4 py-4">
                <div className="relative size-20 shrink-0 overflow-hidden bg-neutral-100 sm:size-24">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] uppercase leading-[1.4] tracking-[0.02em] sm:text-[14px]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[12px] text-black/60">Quantity: {item.quantity}</p>
                </div>
                <p className="shrink-0 text-[14px]">{formatRupees(item.total)}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="border border-black p-5">
            <h2 className="text-[13px] uppercase tracking-[0.04em]">Summary</h2>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-black/60">Subtotal</dt>
                <dd>{formatRupees(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/60">Shipping</dt>
                <dd>{order.shipping > 0 ? formatRupees(order.shipping) : "Free"}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-black/60">Discount</dt>
                  <dd>−{formatRupees(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-black/15 pt-3 text-[14px]">
                <dt>Total</dt>
                <dd>{formatRupees(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] uppercase tracking-[0.04em] text-black/55">
              {formatPayment(order.paymentMethod)}
            </p>
          </div>

          {order.shippingAddress || order.shippingMethod ? (
            <div className="border border-black/15 p-5">
              <h2 className="text-[13px] uppercase tracking-[0.04em]">Delivery</h2>
              {order.shippingAddress ? (
                <div className="mt-4 text-[13px] leading-[1.6]">
                  {order.shippingAddress.name ? (
                    <p className="capitalize">{order.shippingAddress.name}</p>
                  ) : null}
                  {order.shippingAddress.line ? (
                    <p className="capitalize text-black/70">{order.shippingAddress.line}</p>
                  ) : null}
                </div>
              ) : null}
              {order.shippingMethod ? (
                <p className="mt-3 text-[12px] uppercase tracking-[0.04em] text-black/55">
                  {order.shippingMethod}
                </p>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

const inputClassName =
  "h-12 w-full border border-black bg-white px-4 text-[14px] font-normal leading-[1.4] tracking-[0.01em] text-black outline-none placeholder:text-black/50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"

const actionClassName =
  "flex h-12 w-full items-center justify-center bg-black px-5 text-[14px] font-normal uppercase leading-none tracking-[0.04em] text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<TrackOrderSearchParams>
}) {
  const params = await searchParams
  const [lookup, siteContent] = await Promise.all([resolveLookup(params), getSiteContent()])
  const page = resolvePage("trackOrderPage", siteContent.trackOrderPage)
  const hasOrder = Boolean(lookup.order)
  const showSignIn = page.show("signIn") && !hasOrder

  return (
    <main className="flex min-h-[calc(100svh-var(--header-stack-height))] bg-white text-black">
      <div className={`mx-auto grid w-full px-5 py-16 sm:px-8 lg:px-20 lg:py-[6.25rem] ${showSignIn ? "max-w-[1600px] lg:grid-cols-2" : hasOrder ? "max-w-[1040px]" : "max-w-[720px]"}`}>
        <section className={showSignIn ? "lg:border-r lg:border-black/55 lg:pr-[6rem]" : undefined}>
          <h1 className="type-title">
            {page.text("intro", "heading")}
          </h1>
          {hasOrder ? null : (
            <p className="mt-3 text-[14px] font-normal leading-[1.4] text-black/60">
              {page.text("intro", "text")}
            </p>
          )}

          {lookup.message ? (
            <p role="status" className="mt-5 text-[13px] font-normal text-black">
              {lookup.message}
            </p>
          ) : null}

          {lookup.order ? <OrderTrackingCard order={lookup.order} /> : null}

          {hasOrder ? (
            <div className="mt-7 flex flex-wrap items-center gap-6 text-[13px] font-normal uppercase tracking-[0.04em]">
              <Link
                href="/account"
                className="inline-flex h-11 items-center justify-center border border-black bg-black px-5 text-white transition-opacity hover:opacity-80"
              >
                Back to My Orders
              </Link>
              <Link
                href="/track-order"
                className="text-black/60 underline underline-offset-4 transition-colors hover:text-black"
              >
                Track Another Order
              </Link>
            </div>
          ) : (
          <>
          <form action={trackOrderAction} className="mt-7 space-y-3" noValidate>
            <label className="sr-only" htmlFor="order-number">
              Order number
            </label>
            <input
              id="order-number"
              name="order-number"
              type="text"
              autoComplete="off"
              defaultValue={params.order ?? ""}
              placeholder="Order Number (from order confirmation email)*"
              className={inputClassName}
            />

            <label className="sr-only" htmlFor="track-email">
              Email address
            </label>
            <input
              id="track-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={params.email ?? ""}
              placeholder="Email*"
              className={inputClassName}
            />

            <label className="sr-only" htmlFor="shipping-postcode">
              Shipping ZIP code
            </label>
            <input
              id="shipping-postcode"
              name="postcode"
              type="text"
              autoComplete="postal-code"
              placeholder="Shipping Zip Code*"
              className={inputClassName}
            />

            <button type="submit" className={`${actionClassName} mt-6`}>
              {page.text("intro", "button")}
            </button>
          </form>

          <Link
            href="/privacy"
            className="mt-7 inline-block text-[13px] font-normal text-black/60 underline underline-offset-4 transition-colors hover:text-black"
          >
            Privacy Policy
          </Link>
          </>
          )}
        </section>

        {showSignIn ? (
        <section className="mt-16 lg:mt-0 lg:pl-[6rem]">
          <h2 className="type-title">
            {page.text("signIn", "heading")}
          </h2>
          <p className="mt-3 text-[14px] font-normal leading-[1.4] text-black/60">
            {page.text("signIn", "text")}
          </p>

          <form className="mt-7 space-y-3" noValidate>
            <label className="sr-only" htmlFor="account-email">
              Email address
            </label>
            <input
              id="account-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email*"
              className={inputClassName}
            />

            <label className="sr-only" htmlFor="account-password">
              Password
            </label>
            <input
              id="account-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password*"
              className={inputClassName}
            />

            <div className="flex items-center justify-between gap-4 pt-2 text-[13px] font-normal text-black/60">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" className="size-4 accent-black" />
                <span>Remember me</span>
              </label>
              <Link
                href="/login"
                className="underline underline-offset-2 transition-colors hover:text-black"
              >
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className={`${actionClassName} mt-6`}>
              Sign in
            </button>
            <p className="py-0.5 text-center text-[13px] font-normal uppercase tracking-[0.04em] text-black/60">Or</p>
            <button type="button" className={actionClassName}>
              Email me a verification code
            </button>
          </form>

          <p className="mx-auto mt-3 max-w-[31rem] text-center text-[12px] font-normal leading-[1.6] text-black/60 sm:text-[13px]">
            By submitting my information I agree to the Framing World{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-black">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-black">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-black">
              Terms and Conditions.
            </Link>
          </p>
        </section>
        ) : null}
      </div>
    </main>
  )
}
