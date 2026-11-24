import { QuoteForm } from "@/components/storefront/QuoteForm"
export const metadata = { title: "Request a Framing Quote | Framing World", description: "Request pricing for custom framing, mouldings, mount boards and stretchers. Customers, distributors and international buyers welcome." }
export default async function Page({ searchParams }: { searchParams: Promise<{ details?: string }> }) {
 const { details } = await searchParams
 return <main className="bg-white px-5 py-16 text-black"><div className="mx-auto max-w-2xl"><p className="text-sm uppercase tracking-widest text-brand-cta">Let?s make it yours</p><h1 className="type-title mt-4">Request a quote</h1><p className="mt-5 text-base">Tell us what you need. Our studio will confirm materials, dimensions, availability and pricing.</p><QuoteForm details={details} /></div></main>
}
