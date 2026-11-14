export type ProductImage = {
  src: string
  alt: string
  objectPosition?: string
}

export type ProductSwatch = {
  name: string
  value: string
}

export type DeliveryPerk = {
  label: string
  detail: string
  icon: "truck" | "exchange" | "shield" | "card" | "returns"
}

export type ProductCard = {
  id: string
  slug?: string
  title?: string
  image: string
  alt: string
  badge?: string
  featured?: boolean
  sizes?: string[]
  swatches: string[]
  gallery?: string[]
  price?: string | null
  compareAtPrice?: string | null
  /** Price per selectable option label (see lib/product-options.ts). */
  priceBySize?: Record<string, string>
}

export type ProductDetail = {
  id?: string
  slug: string
  editLabel: string
  title: string
  breadcrumb: Array<{
    label: string
    href?: string
  }>
  originalPrice: string | null
  price: string
  /** Only shown when backed by real orders / reviews. */
  sold?: string
  rating?: string
  description: string
  subtitle?: string
  modelInfo?: string
  fitNote?: string
  highlightsIntro?: string
  highlights?: Array<{ src: string; title: string; text: string }>
  lifestyleImage?: string | null
  moreFrom?: {
    title: string
    href: string | null
    products: import("@/components/home/TrendingSection").ProductCard[]
  } | null
  offers?: Array<{ code: string; headline: string; detail: string | null }>
  /** FEATURES list (label + value rows); empty = fall back to Additional details. */
  features?: Array<{ label: string; value: string }>
  /** Up to 4 highlight tiles (title + text). */
  highlightStrip?: Array<{ title: string; text: string }>
  fitHeadline?: string
  fitText?: string
  bundleLine?: string
  /** "Shipping, Returns & Exchanges" accordion, from Website content or a product override. */
  shippingSections?: Array<{ title: string; lines: string[] }>
  /** "Origin & Contact" text above the footer contact details. */
  origin?: string
  completeLookProducts?: import("@/components/home/TrendingSection").ProductCard[]
  isDraft?: boolean
  detailsBody: string
  details?: Array<{ name: string; value: string }>
  careNotes: string[]
  shippingNotes: string[]
  colorName: string
  colors: ProductSwatch[]
  /** Labels that identify each variant in the cart. */
  sizes: string[]
  /** Option groups (Size, Glazing, Print media…) for products with several options. */
  optionGroups?: import("@/lib/product-options").OptionGroup[]
  variantChoices?: import("@/lib/product-options").VariantChoice[]
  priceBySize?: Record<string, string>
  gallery: ProductImage[]
  deliveryPerks: DeliveryPerk[]
  completeLook: ProductImage[]
  fitType?: "regular" | "bootcut" | "straight"
}

/**
 * Sample cards for the cart recommendations: real Framing World products
 * (see content/framingworld/catalog), so the links work once the catalog is seeded.
 */
export const trendingProducts: ProductCard[] = [
  {
    id: "sample-majnu-bhai",
    slug: "majnu-bhai",
    title: "Majnu Bhai",
    image: "/images/catalog/majnu-bhai/01.jpg",
    alt: "Majnu Bhai framed print by Framing World",
    sizes: [],
    price: "₹500",
    swatches: [],
    gallery: [
      "/images/catalog/majnu-bhai/01.jpg",
      "/images/catalog/majnu-bhai/02.jpg",
      "/images/catalog/majnu-bhai/03.jpg",
      "/images/catalog/majnu-bhai/04.jpg",
    ],
  },
  {
    id: "sample-canal-heritage",
    slug: "canal-heritage",
    title: "Canal Heritage",
    image: "/images/catalog/canal-heritage/01.jpg",
    alt: "Canal Heritage framed print by Framing World",
    sizes: [],
    price: "₹550",
    swatches: [],
    gallery: [
      "/images/catalog/canal-heritage/01.jpg",
      "/images/catalog/canal-heritage/02.jpg",
      "/images/catalog/canal-heritage/03.jpg",
      "/images/catalog/canal-heritage/04.jpg",
    ],
  },
  {
    id: "sample-andalusian-grace",
    slug: "andalusian-grace",
    title: "Andalusian Grace",
    image: "/images/catalog/andalusian-grace/01.jpg",
    alt: "Andalusian Grace framed print by Framing World",
    sizes: [],
    price: "₹550",
    swatches: [],
    gallery: [
      "/images/catalog/andalusian-grace/01.jpg",
      "/images/catalog/andalusian-grace/02.jpg",
      "/images/catalog/andalusian-grace/03.jpg",
      "/images/catalog/andalusian-grace/04.jpg",
    ],
  },
  {
    id: "sample-slow-luxe",
    slug: "slow-luxe",
    title: "Slow Luxe",
    image: "/images/catalog/slow-luxe/01.jpg",
    alt: "Slow Luxe framed print by Framing World",
    sizes: [],
    price: "₹400",
    swatches: [],
    gallery: [
      "/images/catalog/slow-luxe/01.jpg",
      "/images/catalog/slow-luxe/02.jpg",
      "/images/catalog/slow-luxe/03.jpg",
      "/images/catalog/slow-luxe/04.jpg",
    ],
  },
  {
    id: "sample-shadow-elegance",
    slug: "shadow-elegance",
    title: "Shadow Elegance",
    image: "/images/catalog/shadow-elegance/01.jpg",
    alt: "Shadow Elegance framed print by Framing World",
    sizes: [],
    price: "₹550",
    swatches: [],
    gallery: [
      "/images/catalog/shadow-elegance/01.jpg",
      "/images/catalog/shadow-elegance/02.jpg",
      "/images/catalog/shadow-elegance/03.jpg",
      "/images/catalog/shadow-elegance/04.jpg",
    ],
  },
  {
    id: "sample-orbit-of-imagination",
    slug: "orbit-of-imagination",
    title: "Orbit of Imagination",
    image: "/images/catalog/orbit-of-imagination/01.jpg",
    alt: "Orbit of Imagination framed print by Framing World",
    sizes: [],
    price: "₹400",
    swatches: [],
    gallery: [
      "/images/catalog/orbit-of-imagination/01.jpg",
      "/images/catalog/orbit-of-imagination/02.jpg",
      "/images/catalog/orbit-of-imagination/03.jpg",
      "/images/catalog/orbit-of-imagination/04.jpg",
    ],
  },
  {
    id: "sample-jardin-elegant",
    slug: "jardin-elegant",
    title: "Jardin Élégant",
    image: "/images/catalog/jardin-elegant/01.jpg",
    alt: "Jardin Élégant framed print by Framing World",
    sizes: [],
    price: "₹550",
    swatches: [],
    gallery: [
      "/images/catalog/jardin-elegant/01.jpg",
      "/images/catalog/jardin-elegant/02.jpg",
      "/images/catalog/jardin-elegant/03.jpg",
      "/images/catalog/jardin-elegant/04.jpg",
    ],
  },
  {
    id: "sample-radiant-soul",
    slug: "radiant-soul",
    title: "Radiant Soul",
    image: "/images/catalog/radiant-soul/01.jpg",
    alt: "Radiant Soul framed print by Framing World",
    sizes: [],
    price: "₹400",
    swatches: [],
    gallery: [
      "/images/catalog/radiant-soul/01.jpg",
      "/images/catalog/radiant-soul/02.jpg",
      "/images/catalog/radiant-soul/03.jpg",
      "/images/catalog/radiant-soul/04.jpg",
    ],
  },
]
