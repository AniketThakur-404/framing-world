"use client"
import Link from "next/link"
import { useState } from "react"
import type { Paper } from "@/lib/studio-catalog"
export function PaperCatalogue({ papers }: { papers: Paper[] }) {
  const [category, setCategory] = useState("")
  const [finish, setFinish] = useState("")
  const filtered = papers.filter(p => (!category || p.category === category) && (!finish || p.finish === finish))
  return <div className="mx-auto max-w-7xl px-5 py-16 text-black">
    <p className="text-sm uppercase tracking-widest text-brand-cta">The surface makes the print</p><h1 className="type-title mt-4">Printing papers</h1><p className="mt-5 max-w-2xl text-base leading-relaxed">Explore archival and non-archival papers in one place. Compare surface finishes and ask our studio which paper suits your artwork.</p>
    <div className="my-9 flex flex-wrap gap-5"><label>Paper category<select className="ml-3 border p-3" value={category} onChange={e => setCategory(e.target.value)}><option value="">All papers</option><option>Archival</option><option>Non-Archival</option></select></label><label>Surface<select className="ml-3 border p-3" value={finish} onChange={e => setFinish(e.target.value)}><option value="">All finishes</option>{["Natural Line", "Matte Texture", "Matte Smooth", "Glossy"].map(v => <option key={v}>{v}</option>)}</select></label><button className="underline" onClick={() => { setCategory(""); setFinish("") }}>Reset filters</button></div>
    <p aria-live="polite" className="mb-5 text-sm">{filtered.length} paper options</p>
    {filtered.length ? <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(p => <article key={p.id} className="border-t pt-5">{p.image ? <img src={p.image} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" /> : null}<p className="mt-4 text-sm text-black/60">{p.category} · {p.finish}</p><h2 className="mt-2 text-2xl">{p.seoTitle || p.name}</h2><p className="mt-3 text-base leading-relaxed">{p.description}</p><Link className="mt-5 inline-block underline" href={`/quote?details=${encodeURIComponent(`Printing on ${p.name}`)}`}>Enquire about this paper</Link></article>)}</div> : <div className="bg-[#f4f2ed] p-9"><h2 className="text-2xl">{papers.length ? "No papers match these filters" : "Find the right paper with our studio"}</h2><p className="mt-3 text-base">{papers.length ? "Try another surface or category." : "Our detailed paper catalogue is being prepared. Contact us for current paper options and samples."}</p><Link href="/quote?details=Paper%20selection%20and%20samples" className="mt-5 inline-block underline">Ask about papers</Link></div>}
  </div>
}
