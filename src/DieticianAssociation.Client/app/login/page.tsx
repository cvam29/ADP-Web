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
      {/* Left panel — deep herb green brand side (desktop only) */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-herb-950 px-14 py-14 border-r border-herb-800">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/ADP.svg" alt="ADP logo" width={30} height={30} className="rounded-md" />
          <span className="font-semibold text-herb-100 text-sm tracking-tight">Association of Dietetics Professionals</span>
        </Link>

        <div className="space-y-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-grain-400 mb-4">Member Portal</p>
            <h2 className="text-4xl font-bold text-herb-50 tracking-tight leading-[1.15] mb-4">
              Welcome back to ADP
            </h2>
            <p className="text-herb-400 text-sm leading-relaxed max-w-xs">
              India&apos;s professional community for registered dieticians and nutrition scientists.
            </p>
          </div>
          <div className="space-y-3">
            {trustPoints.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-herb-900 border border-herb-800 rounded-xl px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-herb-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-grain-400" />
                </div>
                <span className="text-herb-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-herb-700 text-xs">
          &copy; {new Date().getFullYear()} Association of Dietetics Professionals
        </p>
      </div>

      {/* Right panel — warm cream form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-14">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <Image src="/ADP.svg" alt="ADP logo" width={28} height={28} className="rounded-md" />
            <span className="font-semibold text-foreground text-sm">ADP</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">Sign in</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-border focus:border-primary focus-visible:ring-0 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
                <Link href="/reset-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
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
                  className="h-11 border-border focus:border-primary focus-visible:ring-0 rounded-xl bg-secondary text-foreground pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2 transition-colors"
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

          <div className="mt-8">
            <Separator className="bg-border" />
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&rsquo;t have an account?{" "}
              <Link href="/membership/join" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Join ADP
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <PageLoading
            minHeightClassName="min-h-0"
            direction="column"
            textClassName="text-sm text-muted-foreground"
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
