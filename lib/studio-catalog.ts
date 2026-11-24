import { z } from "zod"
export const paperSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().min(1).max(160),
  category: z.enum(["Archival", "Non-Archival"]),
  finish: z.enum(["Natural Line", "Matte Texture", "Matte Smooth", "Glossy"]),
  description: z.string().min(1).max(2000),
  image: z.string().refine(v => v === "" || v.startsWith("/images/") || /^https:\/\//.test(v)),
  seoTitle: z.string().max(160), seoDescription: z.string().max(320),
})
export type Paper = z.infer<typeof paperSchema>
export const mouldingSpecSchema = z.object({
  slug: z.string().min(1).max(200), style: z.enum(["Classic", "Modern"]),
  width: z.number().positive().max(20), height: z.number().positive().max(20),
  profileImage: z.string().refine(v => v === "" || v.startsWith("/images/") || /^https:\/\//.test(v)),
})
export type MouldingSpec = z.infer<typeof mouldingSpecSchema>
