"use server"

import { searchCatalog, type SearchResponse } from "@/lib/store/catalog"

/** Search for the search panel; runs on the server so the catalogue isn't sent to the browser. */
export async function searchCatalogAction(query: string): Promise<SearchResponse> {
  return searchCatalog(query)
}
