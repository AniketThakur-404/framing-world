export type ProductCategory = {
  id: string
  title: string
  slug: string
  parentId: string | null
  productCount: number
  visible: boolean
}

/** Starting categories (the Framing World collections); real ones come from the database. */
export const defaultProductCategories: ProductCategory[] = [
  { id: "frames", title: "Frames", slug: "frames", parentId: null, productCount: 0, visible: true },
  { id: "imported-wooden-frames", title: "Imported Wooden Frames", slug: "imported-wooden-frames", parentId: "frames", productCount: 15, visible: true },
  { id: "wall-gallery", title: "Wall Gallery", slug: "wall-gallery", parentId: "frames", productCount: 47, visible: true },
  { id: "prints", title: "Prints", slug: "prints", parentId: null, productCount: 0, visible: true },
  { id: "fine-art-prints", title: "Fine Art Prints", slug: "fine-art-prints", parentId: "prints", productCount: 8, visible: true },
  { id: "uv-prints", title: "UV Prints", slug: "uv-prints", parentId: "prints", productCount: 5, visible: true },
  { id: "molding", title: "Mouldings", slug: "molding", parentId: null, productCount: 29, visible: true },
]
