import { z } from "zod"

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits, numbers only.")

export const pinCodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "PIN code must be exactly 6 digits, numbers only, and cannot start with 0.")

export function validatePhoneNumber(phone: string | null | undefined): { isValid: boolean; error?: string } {
  const trimmed = (phone ?? "").trim()
  if (!/^[0-9]{10}$/.test(trimmed)) {
    return { isValid: false, error: "Phone number must be exactly 10 digits, numbers only." }
  }
  return { isValid: true }
}

export function validatePinCode(pin: string | null | undefined): { isValid: boolean; error?: string } {
  const trimmed = (pin ?? "").trim()
  if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
    return { isValid: false, error: "PIN code must be exactly 6 digits, numbers only, and cannot start with 0." }
  }
  return { isValid: true }
}

export const checkoutItemSchema = z.object({
  productId: z.string().trim().min(1),
  size: z.string().trim().max(200).default(""),
  quantity: z.number().int().min(1).max(20),
})

export const checkoutInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254, "Enter a valid email address."),
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().max(80).default(""),
  phone: phoneSchema,
  address1: z.string().trim().min(3, "Enter your street address.").max(200),
  address2: z.string().trim().max(200).default(""),
  city: z.string().trim().min(1, "Enter your city.").max(100),
  state: z.string().trim().min(1, "Select your state.").max(100),
  postalCode: pinCodeSchema,
  country: z.string().trim().min(1).max(60).default("India"),
  shippingMethod: z.enum(["standard", "second-day", "next-day"]).default("standard"),
  paymentMethod: z.string().trim().min(1).max(32).default("upi"),
  promoCode: z.string().trim().toUpperCase().max(40).optional(),
  giftMessage: z.string().trim().max(500).optional(),
  newsletter: z.boolean().default(false),
  analyticsSessionId: z.string().trim().max(64).optional(),
  items: z
    .array(checkoutItemSchema)
    .min(1, "Your bag is empty.")
    .max(50, "A single order can contain up to 50 lines."),
})

export type CheckoutInput = z.infer<typeof checkoutInputSchema>
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>

export const whatsAppCheckoutSchema = z.object({
  name: z.string().trim().min(1, "Please fill in your name."),
  phone: phoneSchema,
  address: z.string().trim().min(1, "Please fill in your delivery address."),
  city: z.string().trim().default(""),
  pincode: pinCodeSchema,
  note: z.string().trim().default(""),
})

export type WhatsAppCheckoutInput = z.infer<typeof whatsAppCheckoutSchema>

export const razorpayConfirmationSchema = checkoutInputSchema.extend({
  razorpayOrderId: z.string().trim().min(1, "Razorpay Order ID is required."),
  razorpayPaymentId: z.string().trim().min(1, "Razorpay Payment ID is required."),
  razorpaySignature: z.string().trim().min(1, "Razorpay Signature is required."),
})

export type RazorpayConfirmationInput = z.infer<typeof razorpayConfirmationSchema>

export const cartSyncSchema = z
  .array(checkoutItemSchema)
  .max(50)
