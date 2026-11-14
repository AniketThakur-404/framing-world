import { FullWidthBanner } from "@/components/home/FullWidthBanner"
import type { HomeBannerSectionItem } from "@/lib/store/banners"

export function MotionBannerSection({
  banner,
}: {
  banner?: HomeBannerSectionItem | null
}) {
  if (!banner) return null

  return (
    <FullWidthBanner
      banner={banner}
      fallbackSrc="/images/home/hero-2.webp"
      defaultAlt="Framed prints above a sofa"
      className="aspect-[4/3] sm:aspect-[2/1]"
    />
  )
}
