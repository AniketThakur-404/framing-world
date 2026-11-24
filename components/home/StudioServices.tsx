import Link from "next/link"
const services = [
  ["Printing", "Fine art inkjet, canvas and flatbed printing, with colour correction and restoration.", "/pages/printing-services"],
  ["Mounting", "Diasec and face mounting for a clean, contemporary presentation.", "/pages/diasec-mounting"],
  ["Custom mount boards", "Choose board quality, thickness and borders around your artwork.", "/products/custom-mount-board"],
  ["Custom stretchers", "Build to your dimensions, with supports planned by our studio.", "/products/custom-stretcher"],
]
export function StudioServices() { return <section className="bg-white px-5 py-16 text-black sm:px-10"><div className="mx-auto max-w-7xl"><p className="text-sm uppercase tracking-widest text-brand-cta">Made for your artwork</p><h2 className="type-title mt-4">Studio services</h2><div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{services.map(([title, text, href]) => <Link key={href} href={href} className="group border-t border-black/25 pt-5"><h3 className="text-xl group-hover:underline">{title}</h3><p className="mt-4 text-base leading-relaxed text-black/65">{text}</p></Link>)}</div></div></section> }
