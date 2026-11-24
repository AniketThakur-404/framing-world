import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

/**
 * Seeds the home page hero and full-width banners with the Framing World
 * slides (copy and photos from framingworld.in). Skipped when any banner
 * already exists, so it never overwrites edits made in the dashboard.
 *   npx tsx scripts/seed-banners.ts
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL || "postgresql://framingworld:framingworld@127.0.0.1:5432/framingworld"
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  const existingCount = await prisma.banner.count()
  if (existingCount > 0) {
    console.log(`Banners already seeded (${existingCount} found).`)
    return
  }

  await prisma.banner.createMany({
    data: [
      {
        title: "India's best custom framing and printing company",
        subtitle:
          "A premium destination for custom framing and archival printing, combining craftsmanship with museum-grade materials to preserve your art with perfection.",
        desktopImageKey: "/images/home/hero-1.jpg",
        mobileImageKey: "/images/home/mobile/hero-1.jpg",
        ctaText: "Shop Now",
        ctaLink: "/collections/fine-art-prints",
        placement: "HERO",
        textAlignment: "CENTER",
        overlayOpacity: 70,
        isActive: true,
        position: 0,
      },
      {
        title: "Museum Quality Framing",
        subtitle:
          "India's premium destination for custom framing, archival printing, and museum-grade preservation solutions.",
        desktopImageKey: "/images/home/hero-2.webp",
        mobileImageKey: "/images/home/mobile/hero-2.webp",
        ctaText: "Shop Now",
        ctaLink: "/collections/fine-art-prints",
        placement: "HERO",
        textAlignment: "CENTER",
        overlayOpacity: 60,
        isActive: true,
        position: 1,
      },
      {
        title: "Hang the world on your walls",
        subtitle: "Framing Memories, Elevating Art.",
        desktopImageKey: "/images/home/hero-3.webp",
        mobileImageKey: "/images/home/mobile/hero-3.jpg",
        ctaText: "Shop Now",
        ctaLink: "/collections/fine-art-prints",
        placement: "HERO",
        textAlignment: "CENTER",
        overlayOpacity: 80,
        isActive: true,
        position: 2,
      },
      {
        title: "Premium Imported Wooden Frames",
        subtitle: "Timeless elegance and unmatched craftsmanship to elevate your art and décor.",
        desktopImageKey: "/images/home/hero-2.webp",
        mobileImageKey: "/images/home/mobile/hero-2.webp",
        ctaText: "Shop Now",
        ctaLink: "/collections/imported-wooden-frames",
        placement: "MIDDLE",
        textAlignment: "CENTER",
        overlayOpacity: 35,
        isActive: true,
        position: 0,
      },
    ],
  })

  console.log("Successfully seeded the Framing World homepage banners.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
