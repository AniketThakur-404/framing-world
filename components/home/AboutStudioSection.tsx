import Image from "next/image"
import Link from "next/link"
import { Gift, Headphones, ShieldCheck, Truck } from "lucide-react"

import { cn } from "@/lib/utils"

/** The four service promises from the Framing World home page. */
const benefits = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on in-store purchases. Shipping charges apply to online orders.",
    tone: "light",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Need assistance? We're happy to help. Call our team at +91 9818040566.",
    tone: "light",
  },
  {
    icon: Gift,
    title: "Refer A Friend",
    description: "Refer a friend and get 15% off each other.",
    tone: "light",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Your payment details are protected with secure payment processing.",
    tone: "dark",
  },
] as const

/** Founder story, studio photo and the service promises that close the home page. */
export function AboutStudioSection() {
  return (
    <section className="w-full bg-white text-black">
      {/* Top row: founder portrait | story | studio photo */}
      <div className="reveal-stagger grid grid-cols-1 items-stretch lg:grid-cols-[1fr_1.3fr_1fr]">
        <div data-reveal="zoom" className="relative min-h-[280px] w-full overflow-hidden bg-brand-cream sm:min-h-[360px] lg:min-h-[480px]">
          <Image
            src="/images/home/founder.jpg"
            alt="Mr. Kuldeep Sharma, founder of Framing World, in front of the moulding wall"
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            quality={90}
            className="object-cover object-[52%_center]"
          />
        </div>

        <div data-reveal="up" className="flex flex-col items-center justify-center px-6 py-12 text-center sm:px-10 lg:items-start lg:px-12 lg:text-left xl:px-16">
          <p className="text-[12px] font-medium uppercase leading-[20px] tracking-[0.2em] text-brand-cta sm:text-[13px]">
            Founder Of Framing World
          </p>

          <h2 className="type-title mt-4 text-black">Mr. Kuldeep Sharma</h2>

          <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.6] text-ink-700 sm:text-[17px] lg:mx-0">
            Kuldeep Sharma, the visionary behind Framing World, brings over three decades of hands-on
            experience in the art and framing industry. He founded Framing World in 2005 with the
            mission to deliver the finest custom framing and archival printing solutions in India
            and beyond.
          </p>

          <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.6] text-ink-700 sm:text-[17px] lg:mx-0">
            Today Framing World is a trusted name among artists, collectors, galleries, and museums,
            offering world-class framing services from its New Delhi studio.
          </p>

          <Link
            href="/pages/about-us"
            className="btn-sweep mt-7 inline-flex h-11 items-center justify-center border border-black px-7 text-[13px] font-medium uppercase tracking-[0.2em] sm:mt-9"
          >
            Know About Company
          </Link>
        </div>

        <div data-reveal="zoom" data-parallax className="relative min-h-[280px] w-full overflow-hidden bg-black sm:min-h-[360px] lg:min-h-[480px]">
          <Image
            src="/images/home/hero-1.jpg"
            alt="Choosing a frame at the moulding wall in the Framing World studio"
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            quality={90}
            className="object-cover object-[28%_center]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-true-black/55 via-transparent to-transparent" />

          <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
            <p className="font-heading text-[18px] uppercase leading-[1.25] tracking-normal text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] sm:text-[22px]">
              Framing
              <br />
              Memories,
              <br />
              Elevating Art.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row: 4 promises (2x2 on phones, 4 in a row on desktop) */}
      <div className="reveal-stagger grid grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, description, tone }) => (
          <div
            key={title}
            data-reveal="up"
            className={cn(
              "flex aspect-square w-full flex-col items-center justify-center p-4 text-center sm:aspect-[6/5] sm:p-6 lg:p-8",
              tone === "dark" ? "bg-black text-white" : "border-b border-r border-brand-sand bg-brand-cream text-black",
            )}
          >
            <Icon aria-hidden="true" className={cn("size-7 stroke-[1.25] sm:size-9", tone === "dark" ? "text-white" : "text-brand-cta")} />
            <h3 className="mt-4 font-heading text-[16px] font-normal uppercase leading-[1.2] tracking-normal sm:text-[22px] xl:text-[26px]">
              {title}
            </h3>
            <p className={cn("mt-2 max-w-[260px] text-[13px] leading-[1.45] sm:mt-3 sm:text-[15px]", tone === "dark" ? "text-white/80" : "text-ink-700")}>
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
