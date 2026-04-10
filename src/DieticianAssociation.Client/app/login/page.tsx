"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import PageLoading from "@/components/page-loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Eye, EyeOff, ShieldCheck, Users, Award } from "lucide-react"
import { UpdateRoleDtoRole } from "@/services/generated"
import { getSafeRedirect } from "@/lib/safe-redirect"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [didRedirect, setDidRedirect] = useState(false)

  const { login, user, hasRole, mustResetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const adminRedirectRoute = "/admin"
  const userRedirectRoute = "/"

  // 🚀 Redirect when user is set
  useEffect(() => {
    if (!user || didRedirect) return

    if (mustResetPassword) {
      setDidRedirect(true)
      router.push("/reset-password")
      return
    }

    const defaultRoute =
      (hasRole(UpdateRoleDtoRole.admin) || hasRole(UpdateRoleDtoRole.superAdmin))
        ? adminRedirectRoute
        : userRedirectRoute
    const redirectTo = getSafeRedirect(searchParams?.get("redirect"), defaultRoute)

    setDidRedirect(true) // ✅ prevent double redirects
    router.push(redirectTo)
  }, [user, didRedirect, hasRole, mustResetPassword, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await login({ email, password }) // user will update in store/context

    setIsLoading(false)
  }

  const trustPoints = [
    { icon: ShieldCheck, text: "Govt. registered professional body" },
    { icon: Users, text: "5,000+ nutrition professionals" },
    { icon: Award, text: "Accredited continuing education" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand side (desktop only) */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col justify-between bg-zinc-950 px-12 py-14">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/ADP.svg" alt="ADP logo" width={32} height={32} className="rounded-lg" />
          <span className="font-semibold text-white text-sm tracking-tight">Association of Dietetics Professionals</span>
        </Link>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight mb-3">
              Welcome back to ADP
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              India&apos;s professional community for registered dieticians and nutrition scientists.
            </p>
          </div>
          <div className="space-y-4">
            {trustPoints.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-zinc-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-600 text-xs">
          &copy; {new Date().getFullYear()} Association of Dietetics Professionals
        </p>
      </div>

      {/* Right panel — clean form */}
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6 py-14">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/ADP.svg" alt="ADP logo" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">ADP</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">Sign in</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back. Enter your credentials below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-400 focus-visible:ring-0 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</Label>
                <Link href="/reset-password" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-400 focus-visible:ring-0 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-zinc-400 hover:text-zinc-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Separator className="bg-zinc-200 dark:bg-zinc-800" />
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-5">
              Don&rsquo;t have an account?{" "}
              <Link href="/membership/join" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                Join Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <PageLoading
            minHeightClassName="min-h-0"
            direction="column"
            textClassName="text-sm text-zinc-500"
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
