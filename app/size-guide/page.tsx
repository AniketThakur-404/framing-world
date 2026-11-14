import { SizeGuideView } from "@/components/size-guide/SizeGuideView"
import { getSiteContent } from "@/lib/store/site"

export const metadata = {
  title: "Size Guide | Framing World",
  description: "Frame size guide from Framing World.",
}

export const dynamic = "force-dynamic"

/** Figma "Size Guide - Page": heading, fit tabs, jeans diagram and size table. */
export default async function SizeGuidePage() {
  const { sizeGuide } = await getSiteContent()

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 bg-white px-4 pb-20 pt-10 text-black sm:px-6 md:pt-16 lg:px-8">
      <h1 className="type-title max-w-[560px]">
        {sizeGuide.title}
      </h1>
      {sizeGuide.subtitle ? (
        <p className="mt-3 text-[13px] uppercase leading-[1.4] text-black/60 sm:text-[14px]">{sizeGuide.subtitle}</p>
      ) : null}

      <SizeGuideView />
    </main>
  )
}
