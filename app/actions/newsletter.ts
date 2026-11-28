"use server"

import { headers } from "next/headers"
import { after } from "next/server"
import { z } from "zod"

import { notifyNewsletterWelcome } from "@/lib/server/notifications"
import {
  NEWSLETTER_DISCOUNT_PERCENT,
  subscribeToNewsletter,
} from "@/lib/server/services/newsletter"

export type NewsletterFormState =
  | { status: "idle" }
  | { status: "success"; message: string; code: string | null }
  | { status: "error"; message: string }

const emailSchema = z.string().trim().toLowerCase().email().max(254)

// Small per-instance limiter: 5 sign-ups per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const attempts = new Map<string, number[]>()

function isRateLimited(key: string) {
  const now = Date.now()
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS)
  recent.push(now)
  attempts.set(key, recent)
  if (attempts.size > 5000) {
    for (const [k, times] of attempts) {
      if (times.every((time) => now - time >= WINDOW_MS)) attempts.delete(k)
    }
  }
  return recent.length > MAX_PER_WINDOW
}

export async function subscribeNewsletterAction(
  _previous: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("company") ?? "").trim()) {
    return { status: "success", message: "Thanks for subscribing.", code: null }
  }

  const parsed = emailSchema.safeParse(formData.get("email"))
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." }
  }

  const requestHeaders = await headers()
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  if (isRateLimited(ip)) {
    return { status: "error", message: "Too many attempts. Please try again in a few minutes." }
  }

  try {
    const result = await subscribeToNewsletter(parsed.data, { source: "FOOTER", issueCode: true })

    if (result.status === "already-subscribed") {
      return {
        status: "success",
        message: "You're already on the list. Your welcome code was sent when you first signed up.",
        code: null,
      }
    }

    after(() =>
      notifyNewsletterWelcome({
        email: parsed.data,
        code: result.code,
        percent: NEWSLETTER_DISCOUNT_PERCENT,
        expiresAt: result.expiresAt,
      }),
    )

    return {
      status: "success",
      message: result.code
        ? `Welcome! Use this code at checkout for ${NEWSLETTER_DISCOUNT_PERCENT}% off your first order. We've emailed it to you too.`
        : "Welcome back! You're subscribed again.",
      code: result.code,
    }
  } catch (error) {
    console.error("[newsletter] subscribe failed", error)
    return { status: "error", message: "We couldn't sign you up right now. Please try again." }
  }
}
