import type { ContactGroup } from "@/lib/contact-lines"
import { EMPTY_PAGE_CONTENT, PAGE_DEFS, PAGE_KEYS, type PageKey, type StoredPageContent } from "@/lib/page-content"

/**
 * Editable storefront content. The defaults below are exactly what the
 * storefront rendered before the content manager existed, so an empty
 * `site_content` table changes nothing visually.
 */

export type PolicyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }

export type PolicySubsection = {
  title: string
  blocks: PolicyBlock[]
}

export type PolicySection = {
  id: string
  title: string
  navLabel: string
  blocks: PolicyBlock[]
  subsections: PolicySubsection[]
}

export type PolicyContent = {
  title: string
  metaTitle: string
  metaDescription: string
  intro: string[]
  sections: PolicySection[]
}

export type AnnouncementsContent = {
  left: string
  center: string
  right: string
  mobile: string[]
}

export type NavMenuLink = {
  label: string
  href: string
}

export type NavMenuCard = {
  image: string
  alt: string
  eyebrow: string
  title: string
  href: string
}

export type NavigationContent = {
  /** Name of the first top-level menu item ("Shop"). */
  collectionsLabel: string
  /** "Shop" mega menu: the "Collections" link column. */
  edits: NavMenuLink[]
  /** "Services" mega menu, first column ("Printing"). */
  menCollections: NavMenuLink[]
  /** "Services" mega menu, second column ("Services"). */
  categories: NavMenuLink[]
  /** "Services" mega menu, third column ("Company"). */
  menFeatured: NavMenuLink[]
  /**
   * Landscape promo images (up to 3, recommended 1200 × 800 px, 3:2).
   * Shop menu: image 1 on the left, images 2–3 on the right.
   * Services menu: images 2–3 on the right (falls back to whatever exists).
   */
  cards: NavMenuCard[]
  /** Link of the third menu item ("Mouldings"): a plain link, no dropdown. */
  bestsellersHref: string
}

export type LaunchOfferContent = {
  enabled: boolean
  label: string
  /** ISO timestamp the countdown counts down to. */
  endsAt: string
  ctaText: string
  ctaHref: string
}

export type LookbookSlideContent = {
  id: string
  image: string
  alt: string
  /** CSS object-position, e.g. "center 16%". */
  objectPosition: string
}

export type LookbookContent = {
  slides: LookbookSlideContent[]
}

export type EditsContent = {
  heading: string
  tabs: { label: string; active: boolean }[]
  slides: { id: string; image: string; alt: string; label: string; href: string }[]
}

export type ContactContent = {
  eyebrow: string
  titleLines: string[]
  description: string
  phone: string
  phoneHours: string
  email: string
  emailResponse: string
  chatLabel: string
  chatHours: string
  faqs: { question: string; answer: string }[]
}

export type FooterColumn = {
  title: string
  links: NavMenuLink[]
}

export type FooterContent = {
  /** Contact details: used by the product page's "Origin & Contact". */
  contactGroups: ContactGroup[]
  /** Footer link columns. Links with an empty URL are hidden. */
  columns: FooterColumn[]
  newsletterHeading: string
  newsletterPlaceholder: string
  newsletterButton: string
  copyright: string
  /** Small links bottom-right (Privacy Policy, Terms & Conditions). */
  legalLinks: NavMenuLink[]
}

export type ReturnsPageContent = {
  title: string
  image: string
  conditions: string[]
}

export type SizeGuideContent = {
  title: string
  /** Optional line under the title; hidden when empty. */
  subtitle: string
  /** Shown under the size table on /size-guide and in the product size chart. */
  note: string
}

/** Shared product-page text, edited once and used on every product. */
export type ProductPageSharedContent = {
  /** Highlight strip (4 tiles under the badges) on all product pages. */
  showHighlightStrip: boolean
  /** Trust badges under Add to Cart (empty = hidden). */
  returnsBadge: string
  exchangesBadge: string
  /** Accordion "Shipping, Returns & Exchanges" (one paragraph per line). */
  shipping: string
  returns: string
  exchanges: string
  refunds: string
  /** Accordion "Origin & Contact" text, above the footer contact details. */
  origin: string
}

export type SiteContent = Record<PageKey, StoredPageContent> & {
  announcements: AnnouncementsContent
  navigation: NavigationContent
  launchOffer: LaunchOfferContent
  lookbook: LookbookContent
  edits: EditsContent
  contact: ContactContent
  footer: FooterContent
  productPage: ProductPageSharedContent
  returnsPage: ReturnsPageContent
  sizeGuide: SizeGuideContent
  privacyPolicy: PolicyContent
  termsPolicy: PolicyContent
  shippingPolicy: PolicyContent
}

export type SiteContentKey = keyof SiteContent

export const SITE_CONTENT_KEYS: SiteContentKey[] = [
  "announcements",
  "navigation",
  "launchOffer",
  "lookbook",
  "edits",
  "contact",
  "footer",
  "productPage",
  "returnsPage",
  "sizeGuide",
  "privacyPolicy",
  "termsPolicy",
  "shippingPolicy",
  ...PAGE_KEYS,
]

export const SITE_CONTENT_LABELS: Record<SiteContentKey, string> = {
  announcements: "Announcement bar",
  navigation: "Navigation menu",
  launchOffer: "Launch offer",
  lookbook: "Lookbook carousel",
  edits: "Edits carousel",
  contact: "Contact page & FAQs",
  footer: "Footer contact",
  productPage: "Product page",
  returnsPage: "Returns page",
  sizeGuide: "Size guide",
  privacyPolicy: "Privacy policy",
  termsPolicy: "Terms & conditions",
  shippingPolicy: "Shipping & returns policy",
  ...(Object.fromEntries(PAGE_KEYS.map((key) => [key, PAGE_DEFS[key].label])) as Record<PageKey, string>),
}

/** Footer link columns, as on framingworld.in. Links with an empty URL are hidden. */
export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Useful",
    links: [
      { label: "About Us", href: "/pages/about-us" },
      { label: "Blog", href: "/blogs/news" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/pages/faqs" },
    ],
  },
  {
    title: "Printing",
    links: [
      { label: "Printing Service", href: "/pages/printing-services" },
      { label: "Archival Printing", href: "/pages/archivalprinting" },
      { label: "Diasec Mounting", href: "/pages/diasec-mounting" },
      { label: "Face Mounting", href: "/pages/face-mounting" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Mount Cutting", href: "/pages/mountcuttingservice" },
      { label: "Laser Cutting", href: "/pages/lasercuttingservice" },
      { label: "CNC Router", href: "/pages/cncrouterservice" },
      { label: "Our Gallery", href: "/pages/gallery" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/framingworld" },
      { label: "Facebook", href: "https://www.facebook.com/framingworld.in" },
      { label: "YouTube", href: "https://www.youtube.com/@Framing-World" },
      { label: "X", href: "https://x.com/framingworld1" },
      { label: "WhatsApp", href: "https://wa.me/919810828566" },
    ],
  },
]

const p = (text: string): PolicyBlock => ({ type: "paragraph", text })
const list = (...items: string[]): PolicyBlock => ({ type: "list", items })

/*
 * Defaults come from framingworld.in (see content/framingworld). Anything
 * saved in Dashboard → Website content overrides them.
 */
export const DEFAULT_SITE_CONTENT: SiteContent = {
  ...(Object.fromEntries(PAGE_KEYS.map((key) => [key, EMPTY_PAGE_CONTENT])) as Record<PageKey, StoredPageContent>),
  announcements: {
    left: "Custom Framing & Archival Printing",
    center: "Premium Handcrafted Frames",
    right: "Call us: +91 9818040566",
    mobile: [
      "Premium Handcrafted Frames",
      "Custom Framing & Archival Printing",
      "Call us: +91 9818040566",
    ],
  },
  navigation: {
    // First menu ("Shop"): collection links.
    edits: [
      { label: "Shop All", href: "/shop" },
      { label: "Imported Wooden Frames", href: "/collections/imported-wooden-frames" },
      { label: "Wall Gallery", href: "/collections/wall-gallery" },
      { label: "Digital Fine Art", href: "/collections/best-selling-frames" },
      { label: "Fine Art Prints", href: "/collections/fine-art-prints" },
      { label: "UV Prints", href: "/collections/uv-prints" },
      { label: "Art Store", href: "/collections/art-store" },
    ],
    // Second menu ("Services"), column 1: Printing.
    menCollections: [
      { label: "Printing Services", href: "/pages/printing-services" },
      { label: "Archival Printing", href: "/pages/archivalprinting" },
      { label: "Diasec Mounting", href: "/pages/diasec-mounting" },
      { label: "Face Mounting", href: "/pages/face-mounting" },
    ],
    // Column 2: Services.
    categories: [
      { label: "Laser Cutting", href: "/pages/lasercuttingservice" },
      { label: "Mount Cutting", href: "/pages/mountcuttingservice" },
      { label: "CNC Router", href: "/pages/cncrouterservice" },
    ],
    // Column 3: Company.
    menFeatured: [
      { label: "About", href: "/pages/about-us" },
      { label: "Gallery", href: "/pages/gallery" },
      { label: "Blog", href: "/blogs/news" },
      { label: "FAQs", href: "/pages/faqs" },
      { label: "Contact", href: "/contact" },
    ],
    cards: [
      {
        image: "/images/home/tile-frame-wall-gallery.jpg",
        alt: "Gallery wall of black frames with family photographs",
        eyebrow: "Frame Wall",
        title: "Gallery",
        href: "/collections/wall-gallery",
      },
      {
        image: "/images/home/hero-2.webp",
        alt: "Three framed landscape prints above a sofa",
        eyebrow: "Museum Quality",
        title: "Custom Framing",
        href: "/collections/imported-wooden-frames",
      },
      {
        image: "/images/home/hero-3.webp",
        alt: "Framed fine art prints arranged on a picture ledge",
        eyebrow: "Archival",
        title: "Fine Art Prints",
        href: "/collections/fine-art-prints",
      },
    ],
    // Third item ("Mouldings") is a plain link, no dropdown.
    bestsellersHref: "/collections/molding",
    collectionsLabel: "Shop",
  },
  launchOffer: {
    // Hidden for now; switch on from Dashboard → Content → Launch offer.
    enabled: false,
    label: "Sign up & save 15%",
    endsAt: "2027-01-31T00:00:00.000Z",
    ctaText: "Shop Now",
    ctaHref: "/shop",
  },
  lookbook: {
    slides: [
      { id: "gallery-1", image: "/images/pages/gallery/s.jpg", alt: "Framed artwork from the Framing World gallery", objectPosition: "center" },
      { id: "gallery-2", image: "/images/home/tile-frame-wall-gallery.jpg", alt: "Gallery wall of black frames with family photographs", objectPosition: "38% center" },
      { id: "gallery-3", image: "/images/pages/gallery/b_1.jpg", alt: "Wooden photo frame made by Framing World", objectPosition: "center" },
      { id: "gallery-4", image: "/images/home/home-consultation.jpg", alt: "Canvas print hung above an artist's bench", objectPosition: "center 30%" },
      { id: "gallery-5", image: "/images/home/about-1.jpg", alt: "Black framed artwork", objectPosition: "center" },
      { id: "gallery-6", image: "/images/home/tile-best-selling-frames.jpg", alt: "Best-selling Framing World frames", objectPosition: "center" },
    ],
  },
  edits: {
    heading: "Collections",
    tabs: [],
    slides: [
      { id: "collection-1", image: "/images/home/tile-mount-frame-gallery.jpg", alt: "Mount frame gallery", label: "Wall Gallery", href: "/collections/wall-gallery" },
      { id: "collection-2", image: "/images/home/tile-frame-wall-gallery.jpg", alt: "Frame wall gallery", label: "Imported Wooden Frames", href: "/collections/imported-wooden-frames" },
      { id: "collection-3", image: "/images/home/tile-best-selling-frames.jpg", alt: "Best-selling frames", label: "Digital Fine Art", href: "/collections/best-selling-frames" },
      { id: "collection-4", image: "/images/home/home-consultation.jpg", alt: "Canvas print on a wall", label: "Fine Art Prints", href: "/collections/fine-art-prints" },
    ],
  },
  contact: {
    eyebrow: "Contact us",
    titleLines: ["Got any", "questions?"],
    description:
      "Use the form below to get in touch with the sales team, or visit us at D-96, Okhla Industrial Area Phase 1, New Delhi - 110020.",
    phone: "+91 9818040566",
    phoneHours: "Monday - Saturday, 10am - 7pm",
    email: "framingworld@gmail.com",
    emailResponse: "For orders, custom sizes and bulk enquiries",
    chatLabel: "+91 9810828566",
    chatHours: "Monday - Saturday, 10am - 7pm",
    faqs: [
      {
        question: "How do I make a purchase?",
        answer:
          "Shopping with Framing World is simple! Browse our collection, select your favourite photo frame or artwork, choose your preferred size and available customisation options, and click Add to Cart. Proceed to checkout, enter your shipping details, select your preferred payment method, and complete your purchase. Once your order is placed, our team will take care of the rest!",
      },
      {
        question: "How do I know if my order is confirmed?",
        answer:
          "Once your order has been successfully placed, you will receive an order confirmation notification on your registered email address or mobile number, subject to the contact details provided. Your order will then be processed by our team. If you do not receive a confirmation, please contact us at +91 9818040566 or email us at framingworld@gmail.com.",
      },
      {
        question: "Can I change my shipping address after my order is placed?",
        answer:
          "If you need to change your shipping address, please contact our customer support team as soon as possible after placing your order. Address changes may be possible only before your order has been dispatched. Once the order is shipped, we may not be able to modify the delivery address. Please contact us at +91 9818040566 for assistance.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Currently, Framing World offers shipping across India, ensuring your photo frames and artwork are carefully packed for safe delivery. For international shipping enquiries, please contact our customer support team at +91 9818040566 or email us at framingworld@gmail.com to check availability and shipping options for your location.",
      },
      {
        question: "When will my order be shipped?",
        answer:
          "Once your order is successfully placed, our team begins processing it with care. Since many of our products are customised and made to order, processing time may vary depending on the product and its requirements. You will receive an update once your order is ready for dispatch. We take special care to ensure every product is securely packed before shipping.",
      },
      {
        question: "What is your return policy?",
        answer:
          "At Framing World, many of our products are customised according to individual customer requirements. Since these products are made especially for you, we generally do not accept returns or exchanges on customised orders.",
      },
      {
        question: "How long will it take until I receive my order?",
        answer:
          "We aim to deliver your order as quickly and safely as possible. Our product information currently mentions an estimated delivery time of 2–5 days. Actual delivery time may vary depending on your location, product customisation, and courier availability. We also ensure that every frame is securely packed with protective packaging to help prevent damage during transit.",
      },
      {
        question: "Are custom-sized frames available?",
        answer:
          "Yes! At Framing World, we offer custom-sized wooden photo frames tailored to your specific requirements. Whether you need a small photo frame or a large statement piece, we can create a frame to suit your space and preferences.",
      },
      {
        question: "Can I submit my own photo?",
        answer:
          "Absolutely! You can upload your favourite photograph while placing your order and choose your preferred frame style. We will help turn your special memories into beautifully framed keepsakes.",
      },
      {
        question: "Are you shipping to all of India?",
        answer:
          "Yes! Framing World delivers across India. We ensure that every order is carefully packed with protective packaging to help keep your photo frames safe during transit.",
      },
      {
        question: "What type of materials are used for framing?",
        answer:
          "At Framing World, we use carefully selected quality materials to ensure durability and an elegant finish. Our framing materials include premium wooden frames, high-quality mount boards, and acrylic glazing options, providing a beautiful and lasting presentation for your photographs and artwork.",
      },
    ],
  },
  footer: {
    contactGroups: [
      { heading: "For customer care", lines: [{ type: "email", label: "", value: "framingworld@gmail.com" }] },
      {
        heading: "For orders",
        lines: [
          { type: "phone", label: "", value: "+91 9818040566" },
          { type: "whatsapp", label: "WhatsApp", value: "+91 9810828566" },
        ],
      },
      { heading: "Timings", lines: [{ type: "text", label: "", value: "Monday - Saturday: 10am - 7pm" }] },
      {
        heading: "Visit us",
        lines: [{ type: "text", label: "", value: "D-96, Okhla Industrial Area Phase 1, New Delhi - 110020" }],
      },
    ],
    columns: DEFAULT_FOOTER_COLUMNS,
    newsletterHeading: "Sign up & save 15%",
    newsletterPlaceholder: "Your email",
    newsletterButton: "Subscribe",
    copyright: "© 2026, Framing World. All rights reserved.",
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
  productPage: {
    showHighlightStrip: true,
    // Frames are made to order, so there are no return / exchange badges.
    returnsBadge: "",
    exchangesBadge: "",
    shipping: [
      "We deliver across India. Every order is carefully packed with protective packaging to keep your frames safe in transit.",
      "Estimated delivery time is 2–5 days. It may vary with your location, product customisation and courier availability.",
      "Many of our products are made to order, so processing time depends on the product. You will receive an update once your order is ready for dispatch.",
    ].join("\n"),
    returns:
      "Many of our products are customised to individual requirements. Since they are made especially for you, we generally do not accept returns or exchanges on customised orders.",
    exchanges: "",
    refunds: "",
    origin: "Made at the Framing World studio in New Delhi, India.",
  },
  returnsPage: {
    title: "Returns & order help",
    image: "/images/home/about-2.jpg",
    conditions: [
      "Many of our products are customised to individual requirements, so we generally do not accept returns or exchanges on customised orders.",
      "To change your shipping address, contact us as soon as possible after ordering. Changes are only possible before the order has been dispatched.",
      "For any question about an order, call +91 9818040566 or email framingworld@gmail.com with your order number.",
    ],
  },
  sizeGuide: {
    title: "Frame Size Guide",
    subtitle: "",
    note: "Sizes are in inches. Custom sizes are available on request; contact us with the dimensions of your artwork.",
  },
  privacyPolicy: {
    title: "Privacy Policy",
    metaTitle: "Privacy Policy | Framing World",
    metaDescription: "How Framing World collects, uses, protects, and manages personal information.",
    intro: [
      "Last updated: October 29, 2026",
      "Framing World operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the \"Services\"). Framing World is powered by Shopify, which enables us to provide the Services to you. This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.",
      "Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.",
    ],
    sections: [
      {
        id: "personal-information-we-collect-or-process",
        title: "Personal Information We Collect or Process",
        navLabel: "Personal Information We Collect or Process",
        blocks: [
          p("When we use the term \"personal information,\" we are referring to information that identifies or can reasonably be linked to you or another person. Personal information does not include information that is collected anonymously or that has been de-identified, so that it cannot identify or be reasonably linked to you. We may collect or process the following categories of personal information, including inferences drawn from this personal information, depending on how you interact with the Services, where you live, and as permitted or required by applicable law:"),
          list(
            "Contact details including your name, address, billing address, shipping address, phone number, and email address.",
            "Financial information including credit card, debit card, and financial account numbers, payment card information, financial account information, transaction details, form of payment, payment confirmation and other payment details.",
            "Account information including your username, password, security questions, preferences and settings.",
            "Transaction information including the items you view, put in your cart, add to your wishlist, or purchase, return, exchange or cancel and your past transactions.",
            "Communications with us including the information you include in communications with us, for example, when sending a customer support inquiry.",
            "Device information including information about your device, browser, or network connection, your IP address, and other unique identifiers.",
            "Usage information including information regarding your interaction with the Services, including how and when you interact with or navigate the Services.",
          ),
        ],
        subsections: [],
      },
      {
        id: "personal-information-sources",
        title: "Personal Information Sources",
        navLabel: "Personal Information Sources",
        blocks: [
          p("We may collect personal information from the following sources:"),
          list(
            "Directly from you including when you create an account, visit or use the Services, communicate with us, or otherwise provide us with your personal information;",
            "Automatically through the Services including from your device when you use our products or services or visit our websites, and through the use of cookies and similar technologies;",
            "From our service providers including when we engage them to enable certain technology and when they collect or process your personal information on our behalf;",
            "From our partners or other third parties.",
          ),
        ],
        subsections: [],
      },
      {
        id: "how-we-use-your-personal-information",
        title: "How We Use Your Personal Information",
        navLabel: "How We Use Your Personal Information",
        blocks: [
          p("Depending on how you interact with us or which of the Services you use, we may use personal information for the following purposes:"),
          list(
            "Provide, Tailor, and Improve the Services. We use your personal information to provide you with the Services, including to perform our contract with you, to process your payments, to fulfill your orders, to remember your preferences and items you are interested in, to send notifications to you related to your account, to process purchases, returns, exchanges or other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, to facilitate any returns and exchanges, to enable you to post reviews, and to create a customized shopping experience for you, such as recommending products related to your purchases. This may include using your personal information to better tailor and improve the Services.",
            "Marketing and Advertising. We use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you online advertisements for products or services on the Services or other websites, including based on items you previously have purchased or added to your cart and other activity on the Services.",
            "Security and Fraud Prevention. We use your personal information to authenticate your account, to provide a secure payment and shopping experience, detect, investigate or take action regarding possible fraudulent, illegal, unsafe, or malicious activity, protect public safety, and to secure our services. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password or other access details with anyone else.",
            "Communicating with You. We use your personal information to provide you with customer support, to be responsive to you, to provide effective services to you and to maintain our business relationship with you.",
            "Legal Reasons. We use your personal information to comply with applicable law or respond to valid legal process, including requests from law enforcement or government agencies, to investigate or participate in civil discovery, potential or actual litigation, or other adversarial legal proceedings, and to enforce or investigate potential violations of our terms or policies.",
          ),
        ],
        subsections: [],
      },
      {
        id: "how-we-disclose-personal-information",
        title: "How We Disclose Personal Information",
        navLabel: "How We Disclose Personal Information",
        blocks: [
          p("In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:"),
          list(
            "With Shopify, vendors and other third parties who perform services on our behalf (e.g. IT management, payment processing, data analytics, customer support, cloud storage, fulfillment and shipping).",
            "With business and marketing partners to provide marketing services and advertise to you. For example, we use Shopify to support personalized advertising with third-party services based on your online activity with different merchants and websites. Our business and marketing partners will use your information in accordance with their own privacy notices. Depending on where you reside, you may have a right to direct us not to share information about you to show you targeted advertisements and marketing based on your online activity with different merchants and websites..",
            "When you direct, request us or otherwise consent to our disclosure of certain information to third parties, such as to ship you products or through your use of social media widgets or login integrations.",
            "With our affiliates or otherwise within our corporate group.",
            "In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including to respond to subpoenas, search warrants and similar requests), to enforce any applicable terms of service or policies, and to protect or defend the Services, our rights, and the rights of our users or others.",
          ),
        ],
        subsections: [],
      },
      {
        id: "relationship-with-shopify",
        title: "Relationship with Shopify",
        navLabel: "Relationship with Shopify",
        blocks: [
          p("The Services are hosted by Shopify, which collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in countries other than where you reside, in order to provide and improve the Services for you. In addition, to help protect, grow, and improve our business, we use certain Shopify enhanced features that incorporate data and information obtained from your interactions with our Store, along with other merchants and with Shopify. To provide these enhanced features, Shopify may make use of personal information collected about your interactions with our store, along with other merchants, and with Shopify. In these circumstances, Shopify is responsible for the processing of your personal information, including for responding to your requests to exercise your rights over use of your personal information for these purposes. To learn more about how Shopify uses your personal information and any rights you may have, you can visit the [Shopify Consumer Privacy Policy](https://www.shopify.com/legal/privacy/app-users). Depending on where you live, you may exercise certain rights with respect to your personal information here [Shopify Privacy Portal Link](https://privacy.shopify.com/en)."),
        ],
        subsections: [],
      },
      {
        id: "third-party-websites-and-links",
        title: "Third Party Websites and Links",
        navLabel: "Third Party Websites and Links",
        blocks: [
          p("The Services may provide links to websites or other online platforms operated by third parties. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services."),
        ],
        subsections: [],
      },
      {
        id: "children-s-data",
        title: "Children's Data",
        navLabel: "Children's Data",
        blocks: [
          p("The Services are not intended to be used by children, and we do not knowingly collect any personal information about children under the age of majority in your jurisdiction. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted.As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we \"share\" or \"sell\" (as those terms are defined in applicable law) personal information of individuals under 16 years of age."),
        ],
        subsections: [],
      },
      {
        id: "security-and-retention-of-your-information",
        title: "Security and Retention of Your Information",
        navLabel: "Security and Retention of Your Information",
        blocks: [
          p("Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee \"perfect security.\" In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us."),
          p("How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide you with Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies."),
        ],
        subsections: [],
      },
      {
        id: "your-rights-and-choices",
        title: "Your Rights and Choices",
        navLabel: "Your Rights and Choices",
        blocks: [
          p("Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law."),
          list(
            "Right to Access / Know. You may have a right to request access to personal information that we hold about you.",
            "Right to Delete. You may have a right to request that we delete personal information we maintain about you.",
            "Right to Correct. You may have a right to request that we correct inaccurate personal information we maintain about you.",
            "Right of Portability. You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions.",
            "Managing Communication Preferences. We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt out, we may still send you non-promotional emails, such as those about your account or orders that you have made.",
          ),
          p("You may exercise any of these rights where indicated on the Services or by contacting us using the contact details provided below. To learn more about how Shopify uses your personal information and any rights you may have, including rights related to data processed by Shopify, you can visit https://privacy.shopify.com/en."),
          p("We will not discriminate against you for exercising any of these rights. We may need to verify your identity before we can process your requests, as permitted or required under applicable law. In accordance with applicable laws, you may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law."),
        ],
        subsections: [],
      },
      {
        id: "complaints",
        title: "Complaints",
        navLabel: "Complaints",
        blocks: [
          p("If you have complaints about how we process your personal information, please contact us using the contact details provided below. Depending on where you live, you may have the right to appeal our decision by contacting us using the contact details set out below, or lodge your complaint with your local data protection authority."),
        ],
        subsections: [],
      },
      {
        id: "international-transfers",
        title: "International Transfers",
        navLabel: "International Transfers",
        blocks: [
          p("Please note that we may transfer, store and process your personal information outside the country you live in."),
          p("If we transfer your personal information out of the European Economic Area or the United Kingdom, we will rely on recognized transfer mechanisms like the European Commission's Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection."),
        ],
        subsections: [],
      },
      {
        id: "changes-to-this-privacy-policy",
        title: "Changes to This Privacy Policy",
        navLabel: "Changes to This Privacy Policy",
        blocks: [
          p("We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on this website, update the \"Last updated\" date and provide notice as required by applicable law."),
        ],
        subsections: [],
      },
      {
        id: "contact",
        title: "Contact",
        navLabel: "Contact",
        blocks: [
          p("Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please email us at framingworld@gmail.com. You can find our other contact details on our contact information policy."),
        ],
        subsections: [],
      },
    ],
  },
  // framingworld.in has no Terms page; this is the store template adapted for
  // Framing World. Review it before launch.
  termsPolicy: {
    title: "Terms & Conditions",
    metaTitle: "Terms & Conditions | Framing World",
    metaDescription: "Terms governing access to and use of the Framing World website and services.",
    intro: [
      "These Terms & Conditions govern access to and use of the Framing World website and related services (the \"Platform\"). By accessing the Platform or placing an order, the user agrees to be bound by these Terms and the Privacy Policy.",
      "If the user does not agree to these Terms, use of the Platform must be discontinued.",
    ],
    sections: [
      { id: "eligibility", title: "1. Eligibility", navLabel: "1. Eligibility", subsections: [], blocks: [
        p("Use of the Platform is permitted only to individuals who are legally capable of entering into a binding contract under applicable law. Users below 18 years of age may use the Platform only under parental or legal guardian supervision."),
      ] },
      { id: "product-information", title: "2. Product Information", navLabel: "2. Product information", subsections: [], blocks: [
        p("All products offered on the Platform are subject to availability."),
        p("Product images are for representation purposes only. Minor variations in colour, finish, wood grain, or print tone may occur due to photography, lighting conditions, screen settings, or the handmade nature of the product."),
        p("Framing World reserves the right to modify product details, pricing, or availability without prior notice."),
      ] },
      { id: "pricing-payments", title: "3. Pricing & Payments", navLabel: "3. Pricing and payments", subsections: [], blocks: [
        p("All prices are displayed in Indian Rupees (INR), unless stated otherwise."),
        p("Payments must be completed at the time of purchase through authorized payment gateways. Framing World does not store credit card, debit card, UPI, or banking information."),
        p("Orders may be cancelled in the event of pricing errors, payment failures, or suspected fraudulent activity."),
      ] },
      { id: "orders-delivery", title: "4. Orders & Delivery", navLabel: "4. Orders and delivery", subsections: [], blocks: [
        p("Many products are customised and made to order, so processing time varies by product. Delivery timelines provided are estimates and may vary due to customisation, logistics, or other external factors."),
        p("A shipping address can be changed only before the order has been dispatched."),
        p("Risk and ownership of the product transfer to the customer upon successful delivery."),
      ] },
      { id: "returns-refunds", title: "5. Returns & Exchanges", navLabel: "5. Returns and exchanges", subsections: [], blocks: [
        p("Many of our products are customised according to individual customer requirements. Since these products are made especially for you, we generally do not accept returns or exchanges on customised orders."),
      ] },
      { id: "privacy-data", title: "6. Privacy & Data Protection", navLabel: "6. Privacy and data protection", subsections: [], blocks: [
        p("Use of the Platform is subject to the Framing World [Privacy Policy](/privacy)."),
      ] },
      { id: "user-conduct", title: "7. User Conduct", navLabel: "7. User conduct", subsections: [], blocks: [
        p("Users shall not:"),
        list(
          "Engage in fraudulent, unlawful, or abusive conduct",
          "Misuse promotions or discounts",
          "Attempt unauthorized access to systems or data",
          "Interfere with the operation or security of the Platform",
        ),
        p("Framing World reserves the right to take appropriate action in case of violations."),
      ] },
      { id: "intellectual-property", title: "8. Intellectual Property", navLabel: "8. Intellectual property", subsections: [], blocks: [
        p("All content, including trademarks, logos, designs, images, text, and graphics, is the property of Framing World and may not be used without prior written permission."),
      ] },
      { id: "liability", title: "9. Limitation of Liability", navLabel: "9. Limitation of liability", subsections: [], blocks: [
        p("To the extent permitted by law, Framing World shall not be liable for indirect, incidental, or consequential damages. Total liability, if any, shall not exceed the amount paid for the product giving rise to the claim."),
      ] },
      { id: "governing-law", title: "10. Governing Law & Jurisdiction", navLabel: "10. Governing law and jurisdiction", subsections: [], blocks: [
        p("These Terms are governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of the courts located in Delhi, India."),
      ] },
      { id: "modifications", title: "11. Modifications", navLabel: "11. Modifications", subsections: [], blocks: [
        p("Framing World reserves the right to modify these Terms at any time. Continued use of the Platform constitutes acceptance of the revised Terms."),
      ] },
      { id: "contact", title: "12. Contact", navLabel: "12. Contact", subsections: [], blocks: [
        p("For queries or concerns, email Framing World at [framingworld@gmail.com](mailto:framingworld@gmail.com) or call +91 9818040566."),
      ] },
    ],
  },
  // Built from the shipping and returns answers on framingworld.in/pages/faqs.
  shippingPolicy: {
    title: "Shipping & Returns",
    metaTitle: "Shipping & Returns | Framing World",
    metaDescription: "Framing World shipping, delivery and returns information.",
    intro: [],
    sections: [
      {
        id: "shipping-policy",
        title: "Shipping",
        navLabel: "Shipping",
        subsections: [],
        blocks: [
          list(
            "Framing World delivers across India. Every order is carefully packed with protective packaging to help keep your photo frames safe during transit.",
            "Many of our products are customised and made to order, so processing time may vary depending on the product and its requirements. You will receive an update once your order is ready for dispatch.",
            "The estimated delivery time is 2–5 days. Actual delivery time may vary depending on your location, product customisation, and courier availability.",
            "For international shipping enquiries, contact us to check availability and shipping options for your location.",
          ),
        ],
      },
      {
        id: "order-changes",
        title: "Changing an Order",
        navLabel: "Changing an order",
        subsections: [],
        blocks: [
          p("If you need to change your shipping address, please contact our customer support team as soon as possible after placing your order. Address changes may be possible only before your order has been dispatched."),
        ],
      },
      {
        id: "returns-policy",
        title: "Returns & Exchanges",
        navLabel: "Returns and exchanges",
        subsections: [],
        blocks: [
          p("Many of our products are customised according to individual customer requirements. Since these products are made especially for you, we generally do not accept returns or exchanges on customised orders."),
        ],
      },
      {
        id: "policy-support",
        title: "Contact & Support",
        navLabel: "Contact and support",
        subsections: [],
        blocks: [
          p("For shipping or order-related queries, call +91 9818040566 or email [framingworld@gmail.com](mailto:framingworld@gmail.com)."),
        ],
      },
    ],
  },
}

/**
 * Converts a policy section's blocks to the plain-text format the dashboard
 * editor uses: paragraphs separated by blank lines, list items prefixed "- ".
 */
export function policyBlocksToText(blocks: PolicyBlock[]): string {
  return blocks
    .map((block) =>
      block.type === "paragraph" ? block.text : block.items.map((item) => `- ${item}`).join("\n"),
    )
    .join("\n\n")
}

export function policyTextToBlocks(text: string): PolicyBlock[] {
  const blocks: PolicyBlock[] = []
  const chunks = text.replace(/\r\n/g, "\n").split(/\n{2,}/)
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean)
    if (!lines.length) continue
    let items: string[] = []
    let paragraph: string[] = []
    const flushItems = () => {
      if (items.length) blocks.push({ type: "list", items })
      items = []
    }
    const flushParagraph = () => {
      if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") })
      paragraph = []
    }
    for (const line of lines) {
      if (/^[-*•]\s+/.test(line)) {
        flushParagraph()
        items.push(line.replace(/^[-*•]\s+/, ""))
      } else {
        flushItems()
        paragraph.push(line)
      }
    }
    flushItems()
    flushParagraph()
  }
  return blocks
}
