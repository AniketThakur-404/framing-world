import type { Metadata } from "next"

import { CollectionBenefitsBar } from "@/components/collection/CollectionBenefitsBar"
import { CollectionsHub } from "@/components/collection/CollectionsHub"

export const metadata: Metadata = {
  title: "Collections | Framing World",
  description: "Browse every Framing World collection: imported wooden frames, wall galleries, fine art prints, UV prints and mouldings.",
}

export const dynamic = "force-dynamic"

export default async function Page() {
  return (
    <main className="flex-1 bg-white">
      <CollectionsHub />
      <CollectionBenefitsBar />
    </main>
  )
}
