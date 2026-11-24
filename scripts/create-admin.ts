import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "better-auth/crypto"

import { PrismaClient } from "../generated/prisma/client"

/**
 * Creates (or resets) the dashboard admin login from ADMIN_EMAIL and
 * ADMIN_PASSWORD in .env. Safe to run again: it updates the
 * password and role of an existing account instead of failing.
 *
 *   npm run admin:create
 *
 * The password is hashed the same way Better Auth hashes it at sign-up,
 * so the account signs in through the normal login form.
 */
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? ""
const password = process.env.ADMIN_PASSWORD ?? ""
const name = process.env.ADMIN_NAME?.trim() || "Admin"
if (!email || password.length < 8) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) in .env first.")
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  try {
    const hash = await hashPassword(password)
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", emailVerified: true },
      create: { email, name, role: "ADMIN", emailVerified: true },
    })
    const existing = await prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } })
    if (existing) {
      await prisma.account.update({ where: { id: existing.id }, data: { password: hash } })
    } else {
      await prisma.account.create({
        data: { userId: user.id, accountId: user.id, providerId: "credential", password: hash },
      })
    }
    console.log(`Admin ready: ${user.email} (role ${user.role})`)
  } finally {
    await prisma.$disconnect()
  }
}

main()
