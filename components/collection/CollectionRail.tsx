import { PictureRailGallery, type PictureRailItem } from "@/components/ui/picture-rail-gallery"
import { getSiteContent } from "@/lib/store/site"
import { listPublishedCollectionsWithImages } from "@/lib/store/catalog"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE = "/images/home/hero-2.webp"

/**
 * The collections hung as framed pictures on a picture rail. Shown at the top
 * of the shop page and on the home page. One frame per collection link in the
 * site navigation, each opening its collection.
 */
export async function CollectionRail({ fallbackImage, className }: { fallbackImage?: string; className?: string }) {
  const [collections, siteContent] = await Promise.all([listPublishedCollectionsWithImages(5), getSiteContent()])
  const image = fallbackImage || collections.find((collection) => collection.image)?.image || FALLBACK_IMAGE

  const items: PictureRailItem[] = siteContent.navigation.edits
    .filter((link) => link.href.startsWith("/collections/"))
    .map((link, index) => {
      const collection = collections.find((entry) => `/collections/${entry.slug}` === link.href)
      return {
        id: link.href,
        title: link.label,
        href: link.href,
        image: collection?.image || image,
        frame: (["oak", "black", "white"] as const)[index % 3],
        mat: true,
        aspect: index % 2 === 0 ? 0.8 : 1,
        drop: index % 2 === 0 ? 0 : 0.12,
      }
    })

  return (
    <PictureRailGallery
      items={items.length ? items : [{ id: "studio", title: "Framing World", image, frame: "oak", mat: true }]}
      heading="A little inspiration for your walls"
      showCaption={false}
      // Extra room between the title and the picture rail below it.
      className={cn("py-8 sm:py-14 [&_header]:pb-6 sm:[&_header]:pb-10 [&_header_h2]:font-heading [&_header_h2]:font-normal [&_header_h2]:sm:text-4xl", className)}
    />
  )
}
