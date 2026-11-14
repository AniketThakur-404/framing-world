import { FullWidthBanner } from "@/components/home/FullWidthBanner"
import type { HomeBannerSectionItem } from "@/lib/store/banners"
import { cn } from "@/lib/utils"

/**
 * Banner directly below Our Favourite. Accepts an image or a video.
 * Recommended: desktop 1920 × 840 px (16:7), mobile 1080 × 1350 px (4:5).
 */
export function FeatureBannerSection({
  banner,
}: {
  banner?: HomeBannerSectionItem | null
}) {
  if (!banner) return null

  return (
    <FullWidthBanner
      banner={banner}
      fallbackSrc="/images/home/hero-2.webp"
      defaultAlt="Framing World featured banner"
      className={cn(
        "sm:aspect-[16/7]",
        banner.mobileImageUrl ? "aspect-[4/5]" : "aspect-[16/9]"
      )}
    />
  )
}
