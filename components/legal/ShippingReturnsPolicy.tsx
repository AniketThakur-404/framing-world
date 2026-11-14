import { PolicyRenderer } from "@/components/legal/PolicyRenderer"
import { getSiteContent } from "@/lib/store/site"

export async function ShippingReturnsPolicy() {
  const { shippingPolicy } = await getSiteContent()
  return <PolicyRenderer id="policy" policy={shippingPolicy} />
}
