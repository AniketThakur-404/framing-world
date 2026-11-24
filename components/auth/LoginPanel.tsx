"use client"

import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { usePageContent } from "@/lib/site-content-context"

export function LoginPanel() {
  const page = usePageContent("loginPage")
  const [password, setPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim().toLowerCase()
    const password = String(formData.get("password") ?? "")

    setIsPending(true)

    try {
      const result = await authClient.signIn.email({ email, password })

      if (result.error) {
        setIsPending(false)
        toast.error(result.error.message || "The email address or password is incorrect.")
        return
      }

      const role = result.data?.user.role
      const destination = role === "ADMIN" || role === "SUB_ADMIN" ? "/dashboard" : "/"
      window.location.replace(destination)
    } catch {
      setIsPending(false)
      toast.error("We couldn’t sign you in. Please try again.")
    }
  }

  return (
    <div className="w-full text-black">
      <div>
        <h1 className="type-title text-black">
          {page.text("intro", "heading")}
        </h1>
        <p className="mt-3 max-w-sm text-left text-[12px] uppercase leading-[1.6] tracking-normal text-black/70">
          {page.text("intro", "text")}
        </p>
      </div>

      {page.show("email") ? (
        <form onSubmit={handleEmailLogin} className="mt-6">
          <fieldset disabled={isPending}>
            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-[13px] font-normal uppercase leading-none tracking-[0.04em] text-black">
                  Email address
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="YOU@EXAMPLE.COM"
                  className="auth-form-input h-12 w-full border border-black bg-white px-4 text-[16px] sm:text-[13px] font-normal uppercase tracking-[0.02em] text-black outline-none placeholder:text-black/40 focus:ring-1 focus:ring-black"
                />
              </label>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-[13px] font-normal uppercase leading-none tracking-[0.04em] text-black"
                >
                  Password
                </label>
                <span className="relative block">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="current-password"
                    placeholder="8+ CHARACTERS"
                    onChange={(event) => {
                      setPassword(event.target.value)
                    }}
                    className="auth-form-input h-12 w-full border border-black bg-white px-4 pr-12 text-[16px] sm:text-[13px] font-normal uppercase tracking-[0.02em] text-black outline-none placeholder:text-black/40 focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={password.length === 0}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center text-black/55 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:cursor-not-allowed disabled:text-black/25"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="size-[18px] stroke-[1.7]" />
                    ) : (
                      <Eye aria-hidden="true" className="size-[18px] stroke-[1.7]" />
                    )}
                  </button>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 h-12 w-full cursor-pointer bg-black px-5 text-[13px] font-normal uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50"
            >
              {isPending ? "Logging in…" : page.text("email", "button")}
            </button>
          </fieldset>
        </form>
      ) : null}

      {page.show("terms") ? (
        <div className="mt-4 text-center text-[12px] leading-5 text-black/60">
          <p>
            {page.text("terms", "text")}{" "}
            <Link href="/terms" className="whitespace-nowrap text-black underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4">
              T&amp;C
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="whitespace-nowrap text-black underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      ) : null}

      {page.show("signup") ? (
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 border-t border-black/10 pt-5 text-center text-[13px] leading-6 text-black">
          <span className="text-black/60">{page.text("signup", "text")}</span>
          <Link href="/signin" className="whitespace-nowrap font-medium text-black underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4">
            {page.text("signup", "link")}
          </Link>
        </p>
      ) : null}
    </div>
  )
}
