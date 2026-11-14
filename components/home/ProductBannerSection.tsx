import { FullWidthBanner } from "@/components/home/FullWidthBanner"
import type { HomeBannerSectionItem } from "@/lib/store/banners"

export function ProductBannerSection({
  banner,
}: {
  banner?: HomeBannerSectionItem | null
}) {
  if (!banner) return null

  return (
    <FullWidthBanner
      banner={banner}
      fallbackSrc="/images/home/hero-3.webp"
      defaultAlt="Framed fine art prints on a picture ledge"
      className="aspect-[16/7] sm:aspect-[1440/449] min-h-[150px] sm:min-h-0"
    />
  )
}
