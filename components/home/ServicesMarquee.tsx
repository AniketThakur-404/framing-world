import { cn } from "@/lib/utils"

/** The scrolling line from the Framing World home page. */
const marqueeText = "Artwork Framing : Wall Frame Gallery : Custom Framing : Archival Printing"

function MarqueeStrip() {
  return (
    <div className="flex shrink-0 items-center gap-16 pr-16 whitespace-nowrap">
      {Array.from({ length: 4 }).map((_, repeatIndex) => (
        <span key={`repeat-${repeatIndex}`} className="whitespace-nowrap">
          {marqueeText}
        </span>
      ))}
    </div>
  )
}

export function ServicesMarquee() {
  return (
    <section className="w-full overflow-hidden bg-black py-3.5 text-[13px] font-normal uppercase leading-none tracking-normal text-white sm:text-caption">
      <h2 className="sr-only">Our services</h2>

      <div
        className={cn(
          "flex w-max items-center animate-[marquee_26s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none",
          "[will-change:transform]"
        )}
      >
        <MarqueeStrip />
        <MarqueeStrip />
      </div>
    </section>
  )
}
