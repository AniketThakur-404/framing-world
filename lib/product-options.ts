/**
 * Variant options for the storefront.
 *
 * A cart line is "product + size label", and the server finds the variant
 * whose `optionValues.Size` equals that label (the cart and WhatsApp order use this label).
 * Frames have several options (size, glazing, print media…), so each variant
 * stores the whole combination as its Size label, e.g.
 * "8x12 / Normal glass / Enhanced Matt Archival Print", plus the individual
 * values under `optionValues.Options`. The helpers below turn that into the
 * option groups and per-choice prices the product page needs.
 */

export type VariantChoice = {
  /** Label that identifies the variant in the cart (the variant's "Size"). */
  size: string
  /** Option name → value, e.g. { Size: "8x12", Glass: "Normal glass" }. */
  options: Record<string, string>
  price: string
  compareAtPrice: string | null
  inStock: boolean
}

export type OptionGroup = { name: string; values: string[] }

type VariantRow = {
  price: { toString(): string }
  compareAtPrice?: { toString(): string } | null
  inventoryQuantity: number
  optionValues: unknown
}

const SEPARATOR = " / "

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function text(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (value && typeof value === "object") {
    const candidate = (value as Record<string, unknown>).value ?? (value as Record<string, unknown>).name
    return typeof candidate === "string" ? candidate.trim() : ""
  }
  return ""
}

/** One variant as the storefront sees it; null when it has no selectable label. */
export function readVariantChoice(variant: VariantRow): VariantChoice | null {
  const values = record(variant.optionValues)
  const size = text(values.Size ?? values.size)
  if (!size) return null

  const named = Object.fromEntries(
    Object.entries(record(values.Options))
      .map(([name, value]) => [name, text(value)] as const)
      .filter(([, value]) => value),
  )
  // Variants edited in the dashboard lose the named values; the label still splits cleanly.
  const options =
    Object.keys(named).length > 0
      ? named
      : size.includes(SEPARATOR)
        ? Object.fromEntries(size.split(SEPARATOR).map((value, index) => [`Option ${index + 1}`, value.trim()]))
        : {}

  return {
    size,
    options,
    price: `₹${variant.price.toString()}`,
    compareAtPrice: variant.compareAtPrice ? `₹${variant.compareAtPrice.toString()}` : null,
    inStock: variant.inventoryQuantity > 0,
  }
}

export function readVariantChoices(variants: VariantRow[]): VariantChoice[] {
  const seen = new Set<string>()
  const choices: VariantChoice[] = []
  for (const variant of variants) {
    const choice = readVariantChoice(variant)
    if (!choice || seen.has(choice.size)) continue
    seen.add(choice.size)
    choices.push(choice)
  }
  return choices
}

/** Option names with their values, in first-seen order. Empty when variants have a single plain label. */
export function buildOptionGroups(choices: VariantChoice[]): OptionGroup[] {
  const groups = new Map<string, string[]>()
  for (const choice of choices) {
    for (const [name, value] of Object.entries(choice.options)) {
      const values = groups.get(name) ?? []
      if (!values.includes(value)) values.push(value)
      groups.set(name, values)
    }
  }
  return Array.from(groups, ([name, values]) => ({ name, values }))
}

export function priceBySize(choices: VariantChoice[]): Record<string, string> {
  return Object.fromEntries(choices.map((choice) => [choice.size, choice.price]))
}

/**
 * Size labels for a product card. With a single option every value is listed;
 * with several, only the first (cheapest listed) combination, since the full
 * list belongs on the product page.
 */
export function cardSizes(choices: VariantChoice[]): string[] {
  if (choices.length === 0) return []
  const multiOption = choices.some((choice) => Object.keys(choice.options).length > 1)
  return multiOption ? [choices[0].size] : choices.map((choice) => choice.size)
}

/** The variant matching every selected option value, if that combination exists. */
export function findChoice(
  choices: VariantChoice[],
  groups: OptionGroup[],
  selected: Record<string, string>,
): VariantChoice | undefined {
  return choices.find((choice) => groups.every((group) => choice.options[group.name] === selected[group.name]))
}
