import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

/**
 * Seeds the home page editorial grid (3 images) and the collections carousel
 * (5 tiles) with Framing World photos. Each group is skipped when it already
 * has banners, so dashboard edits are never overwritten.
 *   npx tsx scripts/seed-editorial-carousel-banners.ts
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.")
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  console.log("Seeding editorial and collections carousel banners...")

  const editorial = [
    { title: "Gallery-wrapped canvas print by Framing World", image: "/images/catalog/canvas-printing/01.jpg", link: "/products/canvas-printing" },
    { title: "Acrylic photo print with a steel stand-off", image: "/images/catalog/glass-printig/01.jpg", link: "/products/glass-printig" },
    { title: "Framed fine art prints arranged on a picture ledge", image: "/images/home/hero-3.webp", link: "/collections/best-selling-frames" },
  ]

  const existingEditorial = await prisma.banner.count({ where: { placement: "EDITORIAL" } })
  if (existingEditorial === 0) {
    await prisma.banner.createMany({
      data: editorial.map((item, position) => ({
        title: item.title,
        subtitle: null,
        desktopImageKey: item.image,
        mobileImageKey: null,
        ctaText: null,
        ctaLink: item.link,
        placement: "EDITORIAL" as const,
        textAlignment: "CENTER",
        overlayOpacity: 0,
        isActive: true,
        position,
      })),
    })
    console.log("Created 3 editorial grid banners.")
  } else {
    console.log(`Editorial banners already exist (${existingEditorial} found).`)
  }

  // The carousel placement keeps its original database name (DENIM_CAROUSEL).
  const carousel = [
    { label: "Wall Gallery", alt: "Gallery wall of black frames with family photographs", image: "/images/home/tile-frame-wall-gallery.jpg", link: "/collections/wall-gallery" },
    { label: "Imported Wooden Frames", alt: "Three framed landscape prints above a sofa", image: "/images/home/hero-2.webp", link: "/collections/imported-wooden-frames" },
    { label: "Fine Art Prints", alt: "Canvas print hung above an artist's bench", image: "/images/home/home-consultation.jpg", link: "/collections/fine-art-prints" },
    { label: "Digital Fine Art", alt: "Framed fine art prints arranged on a picture ledge", image: "/images/home/hero-3.webp", link: "/collections/best-selling-frames" },
    { label: "Mouldings", alt: "Wall of frame moulding samples at the Framing World studio", image: "/images/home/hero-1.jpg", link: "/collections/molding" },
  ]

  const existingCarousel = await prisma.banner.count({ where: { placement: "DENIM_CAROUSEL" } })
  if (existingCarousel === 0) {
    await prisma.banner.createMany({
      data: carousel.map((item, position) => ({
        title: item.alt,
        subtitle: item.label,
        desktopImageKey: item.image,
        mobileImageKey: null,
        ctaText: null,
        ctaLink: item.link,
        placement: "DENIM_CAROUSEL" as const,
        textAlignment: "CENTER",
        overlayOpacity: 0,
        isActive: true,
        position,
      })),
    })
    console.log("Created 5 collections carousel slides.")
  } else {
    console.log(`Carousel banners already exist (${existingCarousel} found).`)
  }

  console.log("Done!")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
