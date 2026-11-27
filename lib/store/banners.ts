export type BannerTextAlignment = "LEFT" | "CENTER" | "RIGHT"
import { getHomeBanners as dalGetHomeBanners } from "@/lib/server/dal/banners"

/*
 * Home page banners. Copy and photos are the ones on framingworld.in; edit
 * them here. The carousel keeps its original field name (denimCarousel).
 */

export type HomeHeroBanner = {
  id: string
  title: string | null
  subtitle: string | null
  desktopImageUrl: string
  mobileImageUrl: string | null
  /** Crop focus (CSS object-position); null = centre. */
  desktopFocus?: string | null
  mobileFocus?: string | null
  ctaText: string | null
  ctaLink: string | null
  textAlignment: BannerTextAlignment
  overlayOpacity: number
}

export type HomeBannerSectionItem = {
  id: string
  title: string | null
  subtitle: string | null
  desktopImageUrl: string
  mobileImageUrl: string | null
  /** Crop focus (CSS object-position); null = centre. */
  desktopFocus?: string | null
  mobileFocus?: string | null
  ctaText: string | null
  ctaLink: string | null
  overlayOpacity: number
}

export type HomeEditorialBanner = {
  id: string
  title: string | null
  subtitle: string | null
  desktopImageUrl: string
  mobileImageUrl: string | null
  /** Crop focus (CSS object-position); null = centre. */
  desktopFocus?: string | null
  mobileFocus?: string | null
  ctaText: string | null
  ctaLink: string | null
  position: number
}

export type HomeCarouselSlide = {
  id: string
  title: string | null
  subtitle: string | null
  desktopImageUrl: string
  mobileImageUrl: string | null
  /** Crop focus (CSS object-position); null = centre. */
  desktopFocus?: string | null
  mobileFocus?: string | null
  ctaText: string | null
  ctaLink: string | null
  position: number
}

export type HomeBanners = {
  hero: HomeHeroBanner[]
  /** Two side-by-side images directly below the hero (slot 0 left, slot 1 right). */
  split: HomeEditorialBanner[]
  /** Full-width image/video banner directly below Our Favourite. */
  feature: HomeBannerSectionItem | null
  middle: HomeBannerSectionItem | null
  bottom: HomeBannerSectionItem | null
  editorial: HomeEditorialBanner[]
  denimCarousel: HomeCarouselSlide[]
}

export const HOME_BANNERS: HomeBanners = {
  hero: [
    {
      id: "default-hero-1",
      title: "India's best custom framing and printing company",
      subtitle:
        "A premium destination for custom framing and archival printing, combining craftsmanship with museum-grade materials to preserve your art with perfection.",
      desktopImageUrl: "/images/home/hero-1.jpg",
      mobileImageUrl: "/images/home/mobile/hero-1.jpg",
      ctaText: "Shop Now",
      ctaLink: "/collections/fine-art-prints",
      textAlignment: "CENTER",
      overlayOpacity: 70,
    },
    {
      id: "default-hero-2",
      title: "Museum Quality Framing",
      subtitle:
        "India's premium destination for custom framing, archival printing, and museum-grade preservation solutions.",
      desktopImageUrl: "/images/home/hero-2.webp",
      mobileImageUrl: "/images/home/mobile/hero-2.webp",
      ctaText: "Shop Now",
      ctaLink: "/collections/fine-art-prints",
      textAlignment: "CENTER",
      overlayOpacity: 60,
    },
    {
      id: "default-hero-3",
      title: "Hang the world on your walls",
      subtitle: "Framing Memories, Elevating Art.",
      desktopImageUrl: "/images/home/hero-3.webp",
      mobileImageUrl: "/images/home/mobile/hero-3.jpg",
      ctaText: "Shop Now",
      ctaLink: "/collections/fine-art-prints",
      textAlignment: "CENTER",
      overlayOpacity: 80,
    },
  ],
  // Hidden until SPLIT images are uploaded in admin.
  split: [],
  // Hidden until a FEATURE banner (image or video) is uploaded in admin.
  feature: null,
  middle: {
    id: "default-middle",
    title: "Premium Imported Wooden Frames",
    subtitle: "Timeless elegance and unmatched craftsmanship to elevate your art and décor.",
    desktopImageUrl: "/images/home/hero-2.webp",
    mobileImageUrl: "/images/home/mobile/hero-2.webp",
    ctaText: "Shop Now",
    ctaLink: "/collections/imported-wooden-frames",
    overlayOpacity: 35,
  },
  // Hidden until a BOTTOM banner is uploaded in admin.
  bottom: null,
  editorial: [
    {
      id: "default-editorial-0",
      title: "Gallery-wrapped canvas print by Framing World",
      subtitle: null,
      desktopImageUrl: "/images/catalog/canvas-printing/01.jpg",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/products/canvas-printing",
      position: 0,
    },
    {
      id: "default-editorial-1",
      title: "Acrylic photo print with a steel stand-off",
      subtitle: null,
      desktopImageUrl: "/images/catalog/glass-printig/01.jpg",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/products/glass-printig",
      position: 1,
    },
    {
      id: "default-editorial-2",
      title: "Framed fine art prints arranged on a picture ledge",
      subtitle: null,
      desktopImageUrl: "/images/home/hero-3.webp",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/collections/best-selling-frames",
      position: 2,
    },
  ],
  denimCarousel: [
    {
      id: "default-slide-wall-gallery",
      title: "Gallery wall of black frames with family photographs",
      subtitle: "Wall Gallery",
      desktopImageUrl: "/images/home/tile-frame-wall-gallery.jpg",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/collections/wall-gallery",
      position: 0,
    },
    {
      id: "default-slide-wooden-frames",
      title: "Three framed landscape prints above a sofa",
      subtitle: "Imported Wooden Frames",
      desktopImageUrl: "/images/home/hero-2.webp",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/collections/imported-wooden-frames",
      position: 1,
    },
    {
      id: "default-slide-fine-art-prints",
      title: "Canvas print hung above an artist's bench",
      subtitle: "Fine Art Prints",
      desktopImageUrl: "/images/home/home-consultation.jpg",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/collections/fine-art-prints",
      position: 2,
    },
    {
      id: "default-slide-digital-fine-art",
      title: "Framed fine art prints arranged on a picture ledge",
      subtitle: "Digital Fine Art",
      desktopImageUrl: "/images/home/hero-3.webp",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/collections/best-selling-frames",
      position: 3,
    },
    {
      id: "default-slide-mouldings",
      title: "Wall of frame moulding samples at the Framing World studio",
      subtitle: "Mouldings",
      desktopImageUrl: "/images/home/hero-1.jpg",
      mobileImageUrl: null,
      ctaText: null,
      ctaLink: "/collections/molding",
      position: 4,
    },
  ],
}

export async function getHomeBanners(): Promise<HomeBanners> {
  try {
    const banners = await dalGetHomeBanners()
    if (banners) {
      return banners as unknown as HomeBanners
    }
  } catch (error) {
    console.error("[banners] DB getHomeBanners failed, using fallback:", error)
  }
  return HOME_BANNERS
}
