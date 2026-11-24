import { CustomFramingCalculator } from "@/components/product/CustomFramingCalculator"
import { initialFramingSettings } from "@/lib/custom-framing"
export const dynamic = "force-dynamic"
export const metadata = { title: "Custom Canvas Stretcher Calculator | Framing World", description: "Calculate a custom stretcher using outside dimensions, running feet and internal supports. Request a studio quote." }
export default async function Page() { return <main className="bg-white text-black"><CustomFramingCalculator kind="stretcher" settings={initialFramingSettings} /></main> }
