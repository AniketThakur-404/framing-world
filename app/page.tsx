import type { Metadata } from "next"
import { CollectionRail } from "@/components/collection/CollectionRail"

import { HeroFrameScroll } from "@/components/home/HeroFrameScroll"
import { CollectionCarousel } from "@/components/home/CollectionCarousel"
import { EditorialSection } from "@/components/home/EditorialSection"
import { MotionBannerSection } from "@/components/home/MotionBannerSection"
import { RecommendedSection } from "@/components/home/RecommendedSection"
import { AboutStudioSection } from "@/components/home/AboutStudioSection"
import { ProductBannerSection } from "@/components/home/ProductBannerSection"
import { LookbookCarousel } from "@/components/home/LookbookCarousel"
import { LaunchOfferBar } from "@/components/home/LaunchOfferBar"
import { FeatureBannerSection } from "@/components/home/FeatureBannerSection"
import { TrendingSection } from "@/components/home/TrendingSection"
import { SplitBannerSection } from "@/components/home/SplitBannerSection"
import { listPublishedProducts } from "@/lib/store/catalog"
import { getHomeBanners } from "@/lib/store/banners"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Buy Custom Photo Frames Online | Photo Frame Shop | Framing World",
  description:
    "Order custom photo frames online from Delhi's leading photo frame shop. Explore wall photo frames, acrylic photo prints & handmade frames. Easy online frame maker with fast delivery.",
}

export default async function Home() {
  const [products, banners] = await Promise.all([
    listPublishedProducts(),
    getHomeBanners(),
  ])
  
  // "You May Also Like" shows the next 6 products after the 8 in Our Favourite.
  const alsoLike = products.length >= 14 ? products.slice(8, 14) : products.slice(0, 6)

  // The launch offer bar, split banners and feature banner stay hidden unless
  // switched on in the dashboard.
  return (
    <main className="flex-1 bg-black">
      <HeroFrameScroll banner={banners.hero?.[0]} />
      <CollectionRail className="bg-white" />
      <SplitBannerSection banners={banners.split} />
      <LaunchOfferBar />
      <TrendingSection products={products.slice(0, 8)} />
      <FeatureBannerSection banner={banners.feature} />
      <MotionBannerSection banner={banners.middle} />
      <CollectionCarousel slides={banners.denimCarousel} />
      <EditorialSection banners={banners.editorial} />
      <LookbookCarousel />
      <ProductBannerSection banner={banners.bottom} />
      <RecommendedSection products={alsoLike} />
      <AboutStudioSection />
    </main>
  )
}
