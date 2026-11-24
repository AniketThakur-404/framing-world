import "dotenv/config"

import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations use the direct (non-pooled) Neon URL when set, because the
    // pooler can't hold the locks `prisma migrate` needs. A harmless fallback
    // lets `prisma generate` run during image builds.
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://framingworld:framingworld@127.0.0.1:5432/framingworld",
  },
})
