import "server-only"

import { randomInt } from "crypto"

import { Prisma } from "@/generated/prisma/client"
import { getPrisma } from "@/lib/server/db"

/** Matches the footer promise ("Sign up & save 15%"). */
export const NEWSLETTER_DISCOUNT_PERCENT = 15
/** How long a welcome code stays valid after sign-up. */
export const NEWSLETTER_CODE_VALID_DAYS = 60

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateWelcomeCode() {
  let suffix = ""
  for (let i = 0; i < 6; i++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return `WELCOME${NEWSLETTER_DISCOUNT_PERCENT}-${suffix}`
}

export type NewsletterSubscribeResult =
  | { status: "subscribed"; code: string | null; expiresAt: Date | null }
  | { status: "already-subscribed" }

type SubscribeOptions = {
  source: "FOOTER" | "CHECKOUT"
  /** Issue the personal welcome discount (footer sign-ups only). */
  issueCode: boolean
}

/**
 * Adds an email to the newsletter list. New footer sign-ups get a personal,
 * single-use percentage code created as a regular Discount, so it works at
 * checkout and is visible under Dashboard → Discounts.
 */
export async function subscribeToNewsletter(
  rawEmail: string,
  options: SubscribeOptions,
): Promise<NewsletterSubscribeResult> {
  const email = rawEmail.trim().toLowerCase()
  const prisma = getPrisma()

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
    select: { id: true, status: true, discountCode: true },
  })

  // Keep the account-level flag in sync for registered customers.
  await prisma.user.updateMany({
    where: { email: { equals: email, mode: "insensitive" } },
    data: { emailMarketingSubscribed: true },
  })

  if (existing?.status === "SUBSCRIBED") {
    return { status: "already-subscribed" }
  }

  if (existing) {
    // Re-subscribing: reactivate, but never issue a second welcome code.
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { status: "SUBSCRIBED", unsubscribedAt: null },
    })
    return { status: "subscribed", code: null, expiresAt: null }
  }

  if (!options.issueCode) {
    await prisma.newsletterSubscriber.create({
      data: { email, source: options.source },
    })
    return { status: "subscribed", code: null, expiresAt: null }
  }

  const expiresAt = new Date(Date.now() + NEWSLETTER_CODE_VALID_DAYS * 86_400_000)

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateWelcomeCode()
    try {
      await prisma.$transaction([
        prisma.discount.create({
          data: {
            title: `Newsletter welcome · ${email}`,
            code,
            type: "ORDER",
            method: "CODE",
            status: "ACTIVE",
            valueType: "PERCENTAGE",
            value: new Prisma.Decimal(NEWSLETTER_DISCOUNT_PERCENT),
            appliesTo: "ALL",
            usageLimit: 1,
            onePerCustomer: true,
            endsAt: expiresAt,
            config: { source: "NEWSLETTER_WELCOME", email },
          },
        }),
        prisma.newsletterSubscriber.create({
          data: { email, source: options.source, discountCode: code },
        }),
      ])
      return { status: "subscribed", code, expiresAt }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = String((error.meta as { target?: unknown } | undefined)?.target ?? "")
        // Same email submitted twice at once: the other request won.
        if (target.includes("email")) return { status: "already-subscribed" }
        continue // code collision, try another
      }
      throw error
    }
  }

  throw new Error("Could not generate a unique welcome code.")
}
