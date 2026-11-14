"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Check,
  Copy,
  CreditCard,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Undo2,
  X,
} from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { ProductDetail } from "@/components/product/productData"
import type { ProductCard as HomeProductCard } from "@/components/home/TrendingSection"
import { ScrollRow } from "@/components/ScrollRow"
import { findChoice } from "@/lib/product-options"
import { useCart } from "@/lib/cart-context"
import { useSiteContent } from "@/lib/site-content-context"
import { ContactLineItem } from "@/components/ContactLines"
import type { ProductCard } from "@/components/product/productData"

const deliveryIcons = {
  truck: Truck,
  exchange: RefreshCcw,
  shield: ShieldCheck,
  card: CreditCard,
  returns: Undo2,
} as const

/** Stored labels are uppercase; spec names read "Article Code", "Frame" on the page. */
function toDisplayCase(label: string) {
  if (label !== label.toUpperCase()) return label
  return label.toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (_, sep, char) => sep + char.toUpperCase())
}

// The built-in chevrons are hidden; Figma uses "+" closed and "x" open.
const accordionTriggerClass =
  "h-[60px] items-center rounded-none py-0 text-h4 uppercase tracking-normal text-ink-800 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:!hidden"
const accordionBodyClass =
  "w-full min-w-0 max-w-full pb-6 text-body font-normal text-ink-700 break-words"

function OptionButton({
  active,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center border text-[18px] font-medium leading-[25px] transition-[background-color,border-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/45 sm:text-h4",
        active
          ? "border-[#333333] bg-[#ebebeb] text-ink-900"
          : "border-[#e6e6e6] bg-white text-ink-650 hover:border-[#333333]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** Bolds the first mention of the product (line) name inside the description (Figma). */
function DescriptionText({ text, names }: { text: string; names: string[] }) {
  const lower = text.toLowerCase()
  const productName = names.find((name) => name && lower.includes(name.toLowerCase())) ?? ""
  const index = productName ? lower.indexOf(productName.toLowerCase()) : -1
  if (index < 0) return <p className="whitespace-pre-line">{text}</p>

  return (
    <p className="whitespace-pre-line">
      {text.slice(0, index)}
      <strong className="font-bold">{text.slice(index, index + productName.length)}</strong>
      {text.slice(index + productName.length)}
    </p>
  )
}

function OfferCard({ code, headline, detail }: { code: string; headline: string; detail: string | null }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; the code is still visible to copy by hand.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border border-dashed border-black/30 px-4 py-3">
      <div className="min-w-0">
        <p className="text-body-lg text-ink-900">{code}</p>
        <p className="mt-1.5 text-body text-ink-600">
          {headline}
          {detail ? ` ${detail}` : null}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy code ${code}`}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-body text-ink-650 underline underline-offset-[5px] hover:text-black"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

function MiniProductCard({ product }: { product: HomeProductCard }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block w-[180px] shrink-0 snap-start sm:w-[230px]">
      <div data-row-media className="relative aspect-[230/304] overflow-hidden bg-[#efefef]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.alt || product.title}
            fill
            sizes="230px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      {product.lineName || product.category?.name ? (
        <p className="mt-2.5 truncate text-[12px] uppercase leading-none text-ink-400">
          {product.lineName || product.category?.name}
        </p>
      ) : null}
      <p className="mt-1.5 truncate text-[13px] uppercase leading-none text-ink-800">{product.title}</p>
      <p className="mt-1.5 flex items-baseline gap-2 text-caption">
        {product.compareAtPrice ? (
          <span className="text-ink-600 line-through">{product.compareAtPrice}</span>
        ) : null}
        <span className="font-medium text-ink-900">{product.price}</span>
      </p>
    </Link>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AccordionItem value={title} className="border-b border-black/15">
      <AccordionTrigger className={accordionTriggerClass}>
        <span>{title}</span>
        <Plus aria-hidden="true" className="size-[22px] shrink-0 stroke-[1.5] group-aria-expanded/accordion-trigger:hidden" />
        <X aria-hidden="true" className="hidden size-[22px] shrink-0 stroke-[1.5] group-aria-expanded/accordion-trigger:block" />
      </AccordionTrigger>
      <AccordionContent className={accordionBodyClass}>{children}</AccordionContent>
    </AccordionItem>
  )
}

export function ProductSummary({
  product,
}: {
  product: ProductDetail
}) {
  const [selectedColor, setSelectedColor] = useState(product.colorName)
  const [plainSize, setPlainSize] = useState(product.sizes[0] ?? "")

  // Products with several options (size, glazing, print media…): one group of
  // buttons per option, and the chosen combination picks the variant + price.
  const optionGroups = product.optionGroups ?? []
  const variantChoices = product.variantChoices ?? []
  const hasOptionGroups = optionGroups.length > 0 && variantChoices.length > 0
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => variantChoices[0]?.options ?? {},
  )
  const activeChoice = hasOptionGroups
    ? (findChoice(variantChoices, optionGroups, selectedOptions) ?? variantChoices[0])
    : variantChoices.find((choice) => choice.size === plainSize)
  const selectedSize = hasOptionGroups ? (activeChoice?.size ?? "") : plainSize
  const displayPrice = activeChoice?.price ?? product.price
  const displayOriginalPrice = activeChoice ? activeChoice.compareAtPrice : product.originalPrice

  const selectOption = (name: string, value: string) => {
    const next = { ...selectedOptions, [name]: value }
    // Not every combination is sold: fall back to the first one that has this value.
    const match =
      findChoice(variantChoices, optionGroups, next) ??
      variantChoices.find((choice) => choice.options[name] === value)
    setSelectedOptions(match ? match.options : next)
  }

  const { addToCart, setIsCartOpen } = useCart()
  const { footer } = useSiteContent()

  // True only in the browser; the sticky bar is portalled to <body> there so the
  // sticky summary column (its own stacking context) can't paint it behind
  // later sections.
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  // Sticky add-to-cart bar: shown once the main button has scrolled off the top.
  const addToCartRef = useRef<HTMLButtonElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)
  // Checked on every scroll frame rather than with an IntersectionObserver:
  // a fast fling can jump past the button without ever "crossing" it.
  useEffect(() => {
    const target = addToCartRef.current
    if (!target) return
    let frame = 0
    const update = () => {
      frame = 0
      // Only alongside the product details: hidden again once the main product
      // area has scrolled away, so it never covers "It's in the Details".
      const area = target.closest("section")
      const areaEnded = area ? area.getBoundingClientRect().bottom < window.innerHeight * 0.6 : false
      setShowStickyBar(target.getBoundingClientRect().bottom < 0 && !areaEnded)
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  const productCard: ProductCard = {
    id: product.id || product.slug,
    title: product.title,
    slug: product.slug,
    image: product.gallery[0]?.src || "",
    alt: product.title,
    sizes: product.sizes,
    swatches: product.colors.map((c) => c.value),
    gallery: product.gallery.map((g) => g.src),
    price: displayPrice,
    priceBySize: product.priceBySize,
  }

  const handleAddToCart = () => {
    addToCart(productCard, selectedSize || product.sizes[0] || "")
    setIsCartOpen(true)
  }

  // Details named like "Materials & Care" become their own accordion section;
  // short names ("Frame", "Glazing") are listed as specs under Features & Care.
  const details = product.details ?? []
  const sectionDetails = details.filter((detail) => detail.name.includes("&"))
  const specDetails = details.filter((detail) => !detail.name.includes("&"))
  const hasSection = (pattern: RegExp) => sectionDetails.some((detail) => pattern.test(detail.name))
  // Structured specs from the admin win; older products list their short-named details.
  const features: Array<{ label: string; value: string }> =
    product.features && product.features.length > 0
      ? product.features
      : specDetails.map((detail) => ({ label: toDisplayCase(detail.name), value: detail.value }))
  const hasCountryInFeatures = features.some((feature) => /origin/i.test(feature.label))
  const origin = hasCountryInFeatures ? undefined : specDetails.find((detail) => /origin/i.test(detail.name))?.value

  return (
    <aside className="self-start w-full min-w-0 max-w-full [overflow-anchor:none] lg:sticky lg:top-[calc(var(--header-stack-height)+24px)]">
      <div className="w-full min-w-0 max-w-full space-y-6 text-black">
        <div>
          <p className="text-caption uppercase text-ink-400">{product.editLabel}</p>
          <h1 className="mt-2 font-heading text-[20px] font-normal uppercase leading-none tracking-normal text-ink-800 sm:text-[24px]">
            {product.title}
          </h1>
          {product.subtitle ? (
            <p className="mt-3 text-body text-ink-600">{product.subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-baseline gap-3">
            {displayOriginalPrice ? (
              <span className="text-body-lg text-ink-600 line-through">{displayOriginalPrice}</span>
            ) : null}
            <span className="text-h3 text-ink-900">{displayPrice}</span>
          </div>

          {product.sold ? (
            <div className="flex items-center gap-2">
              <span className="text-body text-ink-600">{product.sold}</span>
              {product.rating ? (
                <>
                  <span className="text-body text-black/25">|</span>
                  <span className="text-h4 text-ink-900">{product.rating}</span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Hidden for products without a colour (the data layer fills in "Default"). */}
        {product.colors.length > 1 || selectedColor !== "Default" ? (
        <section className="space-y-3">
          <p className="text-body-lg text-ink-400">
            Colour: <span className="text-ink-900">{selectedColor}</span>
          </p>

          {product.colors.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            {product.colors.map((color) => {
              const isSelected = color.name === selectedColor

              return (
                <button
                  key={color.name}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Select ${color.name}`}
                  onClick={() => setSelectedColor(color.name)}
                  className={cn(
                    "flex h-[36px] w-[62px] sm:h-[40px] sm:w-[75px] cursor-pointer items-stretch justify-stretch bg-white transition-[box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/45",
                    isSelected
                      ? "border-[2px] border-black p-[3px]"
                      : "border border-neutral-200 p-0"
                  )}
                >
                  <span
                    className="block h-full w-full"
                    style={{ backgroundColor: color.value }}
                  />
                </button>
              )
            })}
          </div>
          ) : null}
        </section>
        ) : null}

        {hasOptionGroups ? (
          optionGroups.map((group) => (
            <section key={group.name} className="space-y-3">
              <p className="text-body-lg text-ink-400">
                {group.name}: <span className="text-ink-900">{selectedOptions[group.name]}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {group.values.map((value) => (
                  <OptionButton
                    key={value}
                    active={selectedOptions[group.name] === value}
                    onClick={() => selectOption(group.name, value)}
                    className="min-h-10 min-w-[64px] px-3 py-2 text-left !text-[14px] !leading-[1.25] sm:!text-[15px]"
                  >
                    {value}
                  </OptionButton>
                ))}
              </div>
            </section>
          ))
        ) : product.sizes.length > 0 ? (
          <section className="space-y-3">
            <p className="text-body-lg text-ink-400">
              Option: <span className="text-ink-900">{selectedSize}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <OptionButton
                  key={size}
                  active={selectedSize === size}
                  onClick={() => setPlainSize(size)}
                  className="min-h-10 min-w-[64px] px-3 py-2 text-left !text-[14px] !leading-[1.25] sm:!text-[15px]"
                >
                  {size}
                </OptionButton>
              ))}
            </div>
          </section>
        ) : null}

        {product.modelInfo || product.fitNote ? (
          <div className="space-y-1 text-body text-ink-600">
            {product.modelInfo ? <p>{product.modelInfo}</p> : null}
            {product.fitNote ? <p>Note: {product.fitNote}</p> : null}
          </div>
        ) : null}

        {/* Figma: a single full-width outlined Add to Cart (571 x 53). */}
        <button
          ref={addToCartRef}
          type="button"
          onClick={handleAddToCart}
          className="flex h-12 w-full cursor-pointer items-center justify-center btn-sweep border border-black text-[18px] font-medium uppercase tracking-[0.01em] text-black active:scale-[0.99] sm:h-[53px] sm:text-h3"
        >
          Add To Cart
        </button>

        {product.offers && product.offers.length > 0 ? (
          <section aria-label="Offers" className="space-y-2">
            {product.offers.map((offer) => (
              <OfferCard key={offer.code} {...offer} />
            ))}
          </section>
        ) : null}

        {product.bundleLine ? (
          <p className="border border-black/15 px-4 py-3 text-body text-ink-900">{product.bundleLine}</p>
        ) : null}

        {product.deliveryPerks.length > 0 ? (
        <section aria-label="Delivery and returns" className="grid grid-cols-2 gap-2 bg-[#f9f9f9] p-2 sm:gap-3 sm:px-4 sm:py-4">
          {product.deliveryPerks.map((perk) => {
            const Icon = deliveryIcons[perk.icon]

            return (
              <div
                key={perk.label}
                className="flex min-h-[41px] min-w-0 items-center gap-2.5 bg-white px-3 py-2 text-[#080808]"
              >
                <Icon className="size-5 shrink-0 stroke-[1.5]" aria-hidden="true" />
                <p className="min-w-0 text-[15px] leading-tight sm:text-body-lg">
                  {perk.label}
                  {perk.detail ? <span className="text-ink-600"> · {perk.detail}</span> : null}
                </p>
              </div>
            )
          })}
        </section>
        ) : null}

        {product.highlightStrip && product.highlightStrip.length > 0 ? (
          <section aria-label="Highlights" className="grid grid-cols-2 gap-px bg-black/10 sm:grid-cols-4">
            {product.highlightStrip.map((tile, index) => (
              <div key={index} className="bg-white px-3 py-3 text-center">
                <p className="text-caption font-medium uppercase text-ink-900">{tile.title}</p>
                {tile.text ? <p className="mt-1.5 text-[13px] leading-[17px] text-ink-600">{tile.text}</p> : null}
              </div>
            ))}
          </section>
        ) : null}

        {product.moreFrom ? (
          <section className="space-y-4 pt-2">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-h4 font-normal uppercase text-black">
                More from {product.moreFrom.title}
              </h2>
              {product.moreFrom.href ? (
                <Link href={product.moreFrom.href} className="text-body text-ink-650 underline underline-offset-[5px] hover:text-black">
                  View all
                </Link>
              ) : null}
            </div>
            <ScrollRow className="gap-2 pb-1" label="More from this collection">
              {product.moreFrom.products.map((item) => (
                <MiniProductCard key={item.id} product={item} />
              ))}
            </ScrollRow>
          </section>
        ) : null}

        {product.completeLookProducts && product.completeLookProducts.length > 0 ? (
          <section className="space-y-4 pt-2">
            <h2 className="text-h4 font-normal uppercase text-black">Complete the Look</h2>
            <ScrollRow className="gap-2 pb-1" label="Complete the look">
              {product.completeLookProducts.map((item) => (
                <MiniProductCard key={item.id} product={item} />
              ))}
            </ScrollRow>
          </section>
        ) : null}

        <Accordion
          id="details"
          type="single"
          defaultValue="Features & Care"
          collapsible
          className="border-t border-black/15"
        >
          <Section title="Features & Care">
            <div className="space-y-4">
              {product.description ? (
                <DescriptionText text={product.description} names={[toDisplayCase(product.editLabel), product.title]} />
              ) : !features.length ? (
                <p>{product.detailsBody || "No details provided."}</p>
              ) : null}
              {features.length > 0 ? (
                <div>
                  <p className="uppercase text-ink-800">Features</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {features.map((feature, idx) => (
                      <li key={idx}>
                        {feature.label}: {feature.value}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Section>

          {!hasSection(/fit|care/i) ? (
            <Section title="Details & Care">
              <div className="space-y-4">
                {product.fitHeadline ? <p className="uppercase text-ink-800">{product.fitHeadline}</p> : null}
                {product.fitText ? <p className="whitespace-pre-line">{product.fitText}</p> : null}
                {product.modelInfo || product.fitNote ? (
                  <div className="space-y-1">
                    {product.modelInfo ? <p>{product.modelInfo}</p> : null}
                    {product.fitNote ? <p>Note: {product.fitNote}</p> : null}
                  </div>
                ) : null}
                {product.careNotes.length > 0 ? (
                  <div>
                    <p className="uppercase text-ink-800">Care</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {product.careNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Section>
          ) : null}
          {!hasSection(/shipping|return|exchange/i) ? (
            <Section title="Shipping, Returns & Exchanges">
              <div className="space-y-4">
                {(product.shippingSections ?? [{ title: "", lines: product.shippingNotes }]).map((section, index) => (
                  <div key={index}>
                    {section.title ? <p className="uppercase text-ink-800">{section.title}</p> : null}
                    <ul className={cn("space-y-1", section.title && "mt-2 list-disc pl-5")}>
                      {section.lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link href="/returns-policy" className="inline-block underline underline-offset-[5px]">
                  Read the full shipping, returns &amp; exchange policy
                </Link>
              </div>
            </Section>
          ) : null}
          {sectionDetails.map((detail, idx) => (
            <Section key={`${detail.name}-${idx}`} title={toDisplayCase(detail.name)}>
              <p className="whitespace-pre-line">{detail.value}</p>
            </Section>
          ))}
          {!hasSection(/origin|contact/i) ? (
            <Section title="Origin & Contact">
              <ul className="space-y-2">
                {product.origin ? <li className="whitespace-pre-line">{product.origin}</li> : null}
                {origin ? <li>Country of Origin: {origin}</li> : null}
                {footer.contactGroups.map((group, index) => (
                  <li key={`${group.heading}-${index}`}>
                    <span className="text-ink-800">{group.heading}</span>
                    {group.lines.map((line, lineIndex) => (
                      <ContactLineItem key={lineIndex} line={line} />
                    ))}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </Accordion>
      </div>

      {/* Figma: "Should be sticky" — compact add-to-cart card once the main button scrolls away. */}
      {isClient
        ? createPortal(
              <div
                aria-hidden={!showStickyBar}
                className={cn(
                  "fixed inset-x-0 bottom-0 z-40 border-t border-black/15 bg-white text-black shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out lg:inset-x-auto lg:bottom-6 lg:right-8 lg:w-[min(573px,calc(40vw-3rem))] lg:border",
                  showStickyBar ? "translate-y-0" : "pointer-events-none translate-y-[calc(100%+24px)]"
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  {product.gallery[0]?.src ? (
                    <div className="relative h-[72px] w-14 shrink-0 overflow-hidden bg-[#efefef]">
                      <Image src={product.gallery[0].src} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] uppercase leading-none text-ink-400">{product.editLabel}</p>
                    <p className="mt-1.5 truncate text-[15px] uppercase leading-none text-ink-800 sm:text-body-lg">{product.title}</p>
                    <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-caption text-ink-600">
                      {selectedSize ? <span className="max-w-full truncate">{selectedSize}</span> : null}
                      {displayOriginalPrice ? <span className="line-through">{displayOriginalPrice}</span> : null}
                      <span className="font-medium text-ink-900">{displayPrice}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    tabIndex={showStickyBar ? 0 : -1}
                    onClick={handleAddToCart}
                    className="h-11 shrink-0 cursor-pointer bg-brand-cta px-4 text-button font-medium uppercase text-white transition-colors hover:bg-brand-terracotta sm:px-6"
                  >
                    Add To Cart
                  </button>
                </div>
              </div>,
            document.body,
          )
        : null}
    </aside>
  )
}
