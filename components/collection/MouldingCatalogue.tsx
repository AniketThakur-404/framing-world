"use client"
import Link from "next/link"
import { useState } from "react"
import type { CatalogProductCard } from "@/lib/store/catalog"
import type { MouldingSpec } from "@/lib/studio-catalog"
export function MouldingCatalogue({ products, specs }: { products: CatalogProductCard[]; specs: MouldingSpec[] }) {
  const [style, setStyle] = useState("")
  const [stock, setStock] = useState("")
  const [width, setWidth] = useState("")
  const bySlug = new Map(specs.map(s => [s.slug, s]))
  const filtered = products.filter(p => {
    const spec = bySlug.get(p.slug)
    return (!style || spec?.style === style) && (!stock || p.isInStock === (stock === "in")) && (!width || (spec && Math.ceil(spec.width) === Number(width)))
  })
  return <main className="bg-white px-5 py-16 text-black sm:px-10"><div className="mx-auto max-w-7xl"><p className="text-sm uppercase tracking-widest text-brand-cta">Find your frame profile</p><h1 className="type-title mt-4">Mouldings</h1><p className="mt-5 max-w-2xl text-base">Explore our moulding designs. Hover or focus a profile to inspect its side view. Request pricing for your project, distribution order or international shipment.</p>
    <div className="my-8 flex flex-wrap gap-5"><label>Style<select className="ml-2 border p-3" value={style} onChange={e => setStyle(e.target.value)}><option value="">All styles</option><option>Classic</option><option>Modern</option></select></label><label>Availability<select className="ml-2 border p-3" value={stock} onChange={e => setStock(e.target.value)}><option value="">All stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select></label><label>Front width<select className="ml-2 border p-3" value={width} onChange={e => setWidth(e.target.value)}><option value="">All widths</option>{[1,2,3,4,5].map(v => <option key={v} value={v}>Up to {v} inch{v > 1 ? "es" : ""}</option>)}</select></label><button className="underline" onClick={() => { setStyle(""); setStock(""); setWidth("") }}>Reset</button></div>
    <p className="mb-5 text-sm" aria-live="polite">{filtered.length} profiles</p><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{filtered.map(p => { const spec = bySlug.get(p.slug); return <article key={p.id}><Link href={`/products/${p.slug}`} className="group relative block aspect-square overflow-hidden bg-[#f4f2ed]"><img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />{spec?.profileImage ? <img src={spec.profileImage} alt={`${p.title} side profile`} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100" /> : null}<span className="absolute inset-x-0 bottom-0 bg-black/80 p-3 text-sm text-white">{spec ? `Front ${spec.width} in · Side ${spec.height} in` : "Ask the studio for profile dimensions"}</span></Link><h2 className="mt-4 text-lg">{p.title}</h2><p className="mt-2 text-sm text-black/60">{spec?.style ? `${spec.style} · ` : ""}{p.isInStock ? "In stock" : "Out of stock"}</p><Link className="mt-4 inline-block border-b border-black pb-1" href={`/quote?details=${encodeURIComponent(`Moulding: ${p.title} (${p.slug})`)}`}>Request a quote</Link></article> })}</div>{!filtered.length ? <p className="py-12">No profiles match your filters. Try another selection or contact us for a suitable moulding.</p> : null}
  </div></main>
}
