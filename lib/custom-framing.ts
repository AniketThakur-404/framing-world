import { z } from "zod"

export const framingInputSchema = z.object({
  kind: z.enum(["mount", "stretcher"]),
  width: z.number().positive().max(1000),
  height: z.number().positive().max(1000),
  border: z.number().min(0).max(24).default(2),
  quality: z.enum(["Standard", "Acid-Free", "Museum"]).default("Standard"),
  thickness: z.enum(["0.8", "1.4", "2.2", "3.2"]).default("1.4"),
})
export type FramingInput = z.infer<typeof framingInputSchema>
export type FramingSettings = {
  mountRates: Record<string, number | null>
  stretcherRate: number | null
  maxWidth: number | null
  maxHeight: number | null
  railWidth: number | null
  supportRules: { from: number; vertical: number; horizontal: number }[]
}
export const initialFramingSettings: FramingSettings = {
  mountRates: {}, stretcherRate: null, maxWidth: null, maxHeight: null,
  railWidth: null, supportRules: [],
}
export function calculateFraming(raw: FramingInput, settings: FramingSettings) {
  const input = framingInputSchema.parse(raw)
  const outsideWidth = input.width + (input.kind === "mount" ? input.border * 2 : 0)
  const outsideHeight = input.height + (input.kind === "mount" ? input.border * 2 : 0)
  const area = outsideWidth * outsideHeight / 144
  const rule = [...settings.supportRules].sort((a, b) => b.from - a.from).find(r => Math.max(outsideWidth, outsideHeight) >= r.from)
  const vertical = input.kind === "stretcher" ? rule?.vertical ?? 0 : 0
  const horizontal = input.kind === "stretcher" ? rule?.horizontal ?? 0 : 0
  const rail = settings.railWidth ?? 0
  const runningFeet = (2 * (outsideWidth + outsideHeight) + vertical * Math.max(0, outsideHeight - 2 * rail) + horizontal * Math.max(0, outsideWidth - 2 * rail)) / 12
  const oversized = (settings.maxWidth !== null && outsideWidth > settings.maxWidth) || (settings.maxHeight !== null && outsideHeight > settings.maxHeight)
  const rate = input.kind === "mount" ? settings.mountRates[`${input.quality}:${input.thickness}`] ?? null : settings.stretcherRate
  const configured = settings.maxWidth !== null && settings.maxHeight !== null && (input.kind === "mount" || settings.railWidth !== null)
  const price = rate !== null && rate > 0 && configured && !oversized ? Math.round((input.kind === "mount" ? area : runningFeet) * rate * 100) / 100 : null
  return { outsideWidth, outsideHeight, area, runningFeet, vertical, horizontal, oversized, price, rate }
}

export function isMoulding(product: { slug?: string; title?: string }) {
  return /mould|mold/i.test(`${product.slug ?? ""} ${product.title ?? ""}`)
}
