"use client"
import Link from "next/link"
import { useState } from "react"

const steps = [
  ["Consultation", "We discuss your artwork, its setting and how you want to display it."],
  ["Artwork selection", "Choose your photograph, print or original artwork and confirm its dimensions."],
  ["Glass & mount", "Compare glazing, mount tones and preservation options with the studio."],
  ["Artwork handling", "The artwork is inspected and carefully prepared for mounting."],
  ["Mounting", "The artwork is positioned with a mounting method suited to its material."],
  ["Glass cutting", "Glazing is cut to the frame dimensions and checked before assembly."],
  ["Framing", "The frame, glazing, artwork, mount, back mount and back board come together."],
  ["Finishing", "Corners, surfaces and hanging fittings receive a final inspection."],
  ["Professional packing", "Protective wrapping and edge protection prepare the piece for travel."],
  ["Final dispatch", "Your finished piece is packed and handed over for delivery."],
]
export function FramingProcess({ full = false }: { full?: boolean }) {
  const [step, setStep] = useState(0)
  return <section className="bg-[#172e2b] px-5 py-16 text-white sm:px-10 lg:py-24" aria-label="Process of framing">
    <div className="mx-auto max-w-7xl">
      <p className="text-sm uppercase tracking-widest text-white/65">Inside the studio</p>
      {full ? <h1 className="type-title mt-4">The art of framing</h1> : <h2 className="type-title mt-4">The art of framing</h2>}
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="relative flex min-h-80 items-center justify-center overflow-hidden bg-[#203e39]" aria-label="Six framing layers: frame, glazing, artwork, mount, back mount and back board">
          {["Back Board", "Back Mount", "Mount", "Artwork", "Glazing (Glass)", "Frame"].map((label, i) => <div key={label} className="absolute flex h-40 w-48 items-center justify-center border text-sm transition-transform duration-700 motion-reduce:transition-none" style={{ transform: `translate(${(i - 2.5) * (step === 6 ? 8 : 16)}px, ${(i - 2.5) * (step === 6 ? -6 : -20)}px)`, background: i === 5 ? "transparent" : i === 4 ? "rgba(220,240,240,.2)" : ["#71624c", "#d0c4aa", "#f4ecda", "#476d60"][i], borderWidth: i === 5 ? 12 : 1, borderColor: i === 5 ? "#b69562" : "rgba(255,255,255,.4)", color: i === 2 || i === 1 ? "#222" : "white" }}><span className="absolute -right-24 top-1 whitespace-nowrap text-xs text-white">{label}</span></div>)}
        </div>
        <div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{steps.map(([title], index) => <button key={title} type="button" aria-pressed={step === index} onClick={() => setStep(index)} className={`min-h-12 border px-3 py-3 text-left text-sm transition-colors ${step === index ? "border-white bg-white text-[#172e2b]" : "border-white/25 hover:bg-white/10"}`}>{title}</button>)}</div>
          <div aria-live="polite" className="mt-8 min-h-28"><h3 className="text-2xl">{steps[step][0]}</h3><p className="mt-3 max-w-xl text-base leading-relaxed text-white/75">{steps[step][1]}</p></div>
          <button type="button" className="mt-4 border-b border-white pb-1 text-base" onClick={() => setStep((step + 1) % steps.length)}>Next step</button>
        </div>
      </div>
      {!full ? <Link href="/pages/process-of-framing" className="mt-8 inline-block border-b border-white/60 pb-1">Explore the framing process</Link> : null}
    </div>
  </section>
}
