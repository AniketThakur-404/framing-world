"use client"

import Link from "next/link"
import { useState } from "react"
import { calculateFraming, type FramingInput, type FramingSettings } from "@/lib/custom-framing"

export function CustomFramingCalculator({ kind, settings }: { kind: FramingInput["kind"]; settings: FramingSettings }) {
  const [input, setInput] = useState<FramingInput>({ kind, width: 12, height: 16, border: 2, quality: "Standard", thickness: "1.4" })
  const valid = input.width > 0 && input.height > 0 && input.width <= 1000 && input.height <= 1000 && input.border >= 0 && input.border <= 24
  const result = valid ? calculateFraming(input, settings) : null
  const field = "mt-2 w-full border border-black/25 bg-white p-3 text-base"
  const title = kind === "mount" ? "Custom Mount Board" : "Custom Stretcher"
  const summary = result ? `${title}: artwork ${input.width} × ${input.height} in; outside ${result.outsideWidth} × ${result.outsideHeight} in; ${kind === "mount" ? `${input.quality}, ${input.thickness} mm, border ${input.border} in, ${result.area.toFixed(2)} sq ft` : `${result.runningFeet.toFixed(2)} running ft, ${result.vertical} vertical / ${result.horizontal} horizontal supports`}` : title
  return <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
    <section>
      <p className="text-sm uppercase tracking-widest text-brand-cta">Made to your measurements</p>
      <h1 className="type-title mt-4">{title}</h1>
      <p className="mt-5 text-base leading-relaxed">{kind === "mount" ? "Choose your board and border. See the final outside dimensions before you order." : "Enter the outside dimensions of your finished stretcher. Internal supports are calculated from the studio’s size rules."}</p>
      <div className="mt-8 grid grid-cols-2 gap-5">
        {(["width", "height"] as const).map(key => <label key={key} className="text-base">{kind === "mount" ? "Artwork" : "Outside"} {key} (in)<input className={field} type="number" min="0.1" max="1000" step="0.1" value={input[key]} onChange={e => setInput({ ...input, [key]: Number(e.target.value) })} /></label>)}
        {kind === "mount" ? <>
          <label>Board quality<select className={field} value={input.quality} onChange={e => setInput({ ...input, quality: e.target.value as FramingInput["quality"] })}>{["Standard", "Acid-Free", "Museum"].map(v => <option key={v}>{v}</option>)}</select></label>
          <label>Thickness<select className={field} value={input.thickness} onChange={e => setInput({ ...input, thickness: e.target.value as FramingInput["thickness"] })}>{["0.8", "1.4", "2.2", "3.2"].map(v => <option key={v} value={v}>{v} mm</option>)}</select></label>
          <label className="col-span-2">Border on each side (in)<input className={field} type="number" min="0" max="24" step="0.25" value={input.border} onChange={e => setInput({ ...input, border: Number(e.target.value) })} /></label>
        </> : null}
      </div>
      {kind === "stretcher" ? <Link href="/products/wooden-stretcher" className="mt-6 inline-block underline">Browse standard stretchers</Link> : null}
    </section>
    <section className="bg-[#f4f2ed] p-7 sm:p-10" aria-live="polite">
      <div className="flex h-60 items-center justify-center border border-black/10 bg-white p-8"><div className="flex max-h-full max-w-full items-center justify-center border-[12px] border-[#cbb591] bg-[#f5f0e5] p-6 text-center" style={{ aspectRatio: `${input.width || 1}/${input.height || 1}` }}>{input.width} × {input.height}<br />inches</div></div>
      {result ? <><dl className="mt-8 space-y-4 text-base"><div className="flex justify-between gap-4"><dt>Outside dimensions</dt><dd>{result.outsideWidth} × {result.outsideHeight} in</dd></div><div className="flex justify-between"><dt>{kind === "mount" ? "Board area" : "Timber length"}</dt><dd>{kind === "mount" ? `${result.area.toFixed(2)} sq ft` : `${result.runningFeet.toFixed(2)} running ft`}</dd></div>{kind === "stretcher" ? <div className="flex justify-between"><dt>Internal supports</dt><dd>{settings.railWidth === null ? "Studio review required" : `${result.vertical} vertical · ${result.horizontal} horizontal`}</dd></div> : null}</dl>
        <p className="mt-8 text-2xl">{result.price === null ? "Price on request" : `₹${result.price.toLocaleString("en-IN")}`}</p>
        <p className="mt-3 text-base text-black/65">{result.oversized ? "This size needs a specialist build. Contact our team for a custom quote." : result.price === null ? "Our studio will confirm material availability, support requirements and the final price." : "Calculated from the studio’s approved material rate."}</p>
        <Link className="mt-6 block bg-black px-5 py-4 text-center text-white" href={`/quote?details=${encodeURIComponent(summary)}`}>Request a quote</Link>
      </> : <p role="alert" className="mt-6">Enter positive dimensions and a border between 0 and 24 inches.</p>}
    </section>
  </div>
}
