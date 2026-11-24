import { CustomFramingCalculator } from "@/components/product/CustomFramingCalculator"
import { initialFramingSettings } from "@/lib/custom-framing"
export const dynamic = "force-dynamic"
export const metadata = { title: "Custom Mount Board Calculator | Framing World", description: "Configure mount board quality, thickness, artwork dimensions and borders. Calculate outside dimensions and square-foot area." }
export default async function Page() { return <main className="bg-white text-black"><CustomFramingCalculator kind="mount" settings={initialFramingSettings} /></main> }
