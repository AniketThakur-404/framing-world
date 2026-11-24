import "server-only"

import { getPrisma } from "@/lib/server/db"
import { requirePermission } from "@/lib/server/dal/auth"

/** Categories a product can be filed under (the product editor and filters). */
export type AdminCategoryOption = {
  id: string
  name: string
}

export async function listCategoryOptionsForAdmin(
  excludingCategoryId?: string,
): Promise<AdminCategoryOption[]> {
  await requirePermission("categories.view")
  const prisma = getPrisma()

  return prisma.category.findMany({
    where: excludingCategoryId ? { id: { not: excludingCategoryId } } : {},
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}
