"use client"
import { useState } from "react"
import type { ArtworkAttachment } from "@/lib/artwork"
export function ArtworkUploads({ count, value, onChange, onBusy }: { count: number; value: ArtworkAttachment[]; onChange: (items: ArtworkAttachment[]) => void; onBusy: (busy: boolean) => void }) {
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState("")
  async function upload(file: File | undefined, slot: number) {
    if (!file) return
    if (file.size > 20 * 1024 * 1024 || !["image/jpeg", "image/png", "image/tiff", "application/pdf"].includes(file.type)) { setError("Choose a JPG, PNG, TIFF or PDF up to 20 MB."); return }
    setBusy(slot); onBusy(true); setError("")
    try {
      onChange([...value.filter(item => item.slot !== slot), { id: crypto.randomUUID(), name: file.name, slot }].sort((a,b) => a.slot-b.slot))
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed.") }
    finally { setBusy(null); onBusy(false) }
  }
  return <fieldset className="space-y-4 border-y border-black/15 py-5"><legend className="text-lg">Use your own artwork</legend><p className="text-sm text-black/65">Select one file per frame. JPG, PNG, TIFF or PDF, up to 20 MB each. This preview records filenames only; files are not uploaded or sent with your order.</p>{Array.from({ length: count }, (_, slot) => { const item = value.find(v => v.slot === slot); return <div key={slot}><label className="block text-base">{count > 1 ? `Frame ${slot + 1}` : "Your artwork"}<input type="file" accept="image/jpeg,image/png,image/tiff,application/pdf" disabled={busy !== null} className="mt-2 block w-full text-sm file:mr-3 file:border file:border-black/20 file:bg-white file:p-2" onChange={e => upload(e.target.files?.[0], slot)} /></label>{busy === slot ? <p role="status" className="mt-2 text-sm">Uploading…</p> : item ? <div className="mt-2 flex gap-3 text-sm"><span>{item.name}</span><button type="button" className="underline" onClick={() => onChange(value.filter(v => v.slot !== slot))}>Remove</button></div> : null}</div> })}{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}</fieldset>
}
