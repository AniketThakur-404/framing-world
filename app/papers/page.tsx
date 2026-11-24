import { PaperCatalogue } from "@/components/storefront/PaperCatalogue"
import { papers } from "@/lib/studio-content"
export const dynamic = "force-dynamic"
export const metadata = { title: "Archival & Non-Archival Printing Papers | Framing World", description: "Compare printing papers by Natural Line, Matte Texture, Matte Smooth and Glossy finishes. Ask our studio about paper samples." }
export default async function Page() { return <main className="bg-white"><PaperCatalogue papers={papers} /></main> }
