"use client"
import { useState } from "react"
export function QuoteForm({ details = "" }: { details?: string }) {
 const [opened, setOpened] = useState(false)
 const field = "mt-2 w-full border border-black/25 bg-white p-3"
 return <form className="mt-8 space-y-5" onSubmit={event => {
  event.preventDefault()
  const form = new FormData(event.currentTarget)
  const text = ["Quote request", ...Array.from(form.entries()).map(([key,value]) => key + ": " + value)].join("\n")
  window.open("https://wa.me/919810828566?text=" + encodeURIComponent(text), "_blank", "noopener,noreferrer")
  setOpened(true)
 }}>
 {[["name","Name","text"],["email","Email","email"],["phone","Phone","tel"],["country","Country","text"]].map(([name,label,type]) => <label key={name} className="block">{label}<input name={name} type={type} required={name !== "phone"} maxLength={254} className={field} defaultValue={name === "country" ? "India" : ""} /></label>)}
 <label className="block">I am a<select name="buyer" className={field}><option>Customer</option><option>Distributor</option><option>International buyer</option></select></label>
 <label className="block">Project details<textarea name="details" required maxLength={5000} rows={7} className={field} defaultValue={details.slice(0,5000)} /></label>
 <button className="w-full bg-black p-4 text-white">Request a quote on WhatsApp</button>
 <p className="text-sm text-black/60">Your request opens in WhatsApp. Send the message there to contact our studio.</p>
 {opened ? <p role="status">Your message is ready in WhatsApp. Send it there to complete your enquiry.</p> : null}
 </form>
}
