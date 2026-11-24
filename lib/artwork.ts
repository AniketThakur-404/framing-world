export type ArtworkAttachment = { id: string; name: string; slot: number }
export function artworkSlots(product: { slug?: string; title?: string; description?: string; editLabel?: string }) {
  if (/mould|mold|stretcher|mount-board/i.test(`${product.slug} ${product.title}`)) return 0
  const text = `${product.title} ${product.description}`.toLowerCase()
  const numeric = text.match(/\b(\d{1,2})[ -]?(?:piece|frame|panel|photo)/)
  if (numeric) return Math.min(20, Math.max(1, Number(numeric[1])))
  const words: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
  const spelled = text.match(/\b(two|three|four|five|six|seven|eight|nine|ten)[ -]?(?:piece|frame|panel|photo|elegantly framed)/)
  if (spelled) return words[spelled[1]]
  const slug = product.slug?.match(/set-of-(\d+)/)
  if (slug) return Math.min(20, Number(slug[1]))
  if (/wall.gallery/i.test(product.editLabel ?? "")) return 0 // An unspecified set must be configured by staff, never guess its frame count.
  return 1
}
