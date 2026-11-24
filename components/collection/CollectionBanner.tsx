import Image from "next/image"
import Link from "next/link"

/** Compact collection feature with an uncropped image and a clear destination. */
export function CollectionBanner({
  image,
  alt,
  href,
}: {
  image: string
  alt: string
  href?: string
}) {
  if (!image) return null

  return (
    <section className="mx-4 my-10 grid overflow-hidden bg-black text-white sm:mx-6 sm:my-14 md:grid-cols-[1fr_1.2fr] lg:mx-8">
      <div className="relative h-64 bg-[#f5f3ef] p-6 sm:h-80 md:h-full md:min-h-[320px]">
        <div className="relative h-full min-h-52 w-full md:absolute md:inset-6 md:h-auto md:w-auto">
          <Image src={image} alt={alt} fill sizes="(max-width: 768px) 90vw, 42vw" className="object-contain" />
        </div>
      </div>
      <div className="flex flex-col items-start justify-center px-7 py-10 sm:px-12 sm:py-12 lg:px-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/65">Discover more · Framing World</p>
        <h2 className="mt-4 max-w-lg font-heading text-3xl font-normal leading-tight sm:text-4xl">Find your next favourite.</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">Explore frames and artwork that bring a personal touch to your walls.</p>
        <Link href={href || "/collections/shop"} className="mt-7 inline-flex min-h-11 items-center gap-8 border border-white/70 px-6 py-3 text-xs uppercase tracking-wider transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Explore collection <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
