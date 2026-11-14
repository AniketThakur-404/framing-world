import "dotenv/config"
import { getAuth } from "../lib/auth"

// Creates the first dashboard user. Set both values in .env (or the shell)
// before running; nothing is hard-coded so no password lives in the repo.
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npx tsx scripts/register-admin.ts
// Then run `npm run admin:promote` to give that user the ADMIN role.
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.")
    process.exit(1)
  }

  const auth = getAuth()
  try {
    const result = await auth.api.signUpEmail({
      body: { name: "Admin", email, password },
    })
    console.log("User created:", result.user)
  } catch (error) {
    console.error("Failed to create user:", error)
  }
}

main()
