"use server"

import { redirect } from "next/navigation"

/** WhatsApp number that receives contact-form messages (no backend or email server). */
const WHATSAPP_NUMBER = "919810828566"

const SUBJECTS: Record<string, string> = {
  order: "Order enquiry",
  styling: "Custom framing & printing",
  returns: "Delivery and returns",
  other: "Other",
}

/** Opens a WhatsApp chat with the message filled in. */
export async function submitContactAction(formData: FormData) {
  const field = (name: string) => String(formData.get(name) ?? "").trim()
  if (field("website")) redirect("/contact?status=sent")

  const name = field("name")
  const email = field("email")
  const message = field("message")
  if (!name || !message) redirect("/contact?status=invalid")

  const text = [
    `Hello Framing World, this is ${name}${email ? ` (${email})` : ""}.`,
    `Subject: ${SUBJECTS[field("subject")] ?? "General enquiry"}`,
    "",
    message,
  ].join("\n")
  redirect(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`)
}
