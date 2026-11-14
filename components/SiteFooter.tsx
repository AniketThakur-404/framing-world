import { FooterSection } from "@/components/FooterSection"
import { ServicesMarquee } from "@/components/home/ServicesMarquee"

export function SiteFooter() {
  return (
    <div className="w-full">
      <ServicesMarquee />
      <FooterSection />
    </div>
  )
}
