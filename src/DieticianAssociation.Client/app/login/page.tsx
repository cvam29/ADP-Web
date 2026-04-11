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
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Eye, EyeOff, ShieldCheck, Users, Award, Leaf } from "lucide-react"
import { UpdateRoleDtoRole } from "@/services/generated"
import { getSafeRedirect } from "@/lib/safe-redirect"

const trustPoints = [
  { icon: ShieldCheck, text: "Govt. registered professional body" },
  { icon: Users,       text: "5,000+ nutrition professionals" },
  { icon: Award,       text: "Accredited continuing education" },
]

function LoginForm() {
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]   = useState(false)
  const [didRedirect, setDidRedirect] = useState(false)
  const [mounted, setMounted]       = useState(false)

  const { login, user, hasRole, mustResetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect once user is set
  useEffect(() => {
    if (!user || didRedirect) return
    if (mustResetPassword) {
      setDidRedirect(true)
      router.push("/reset-password")
      return
    }
    const defaultRoute =
      hasRole(UpdateRoleDtoRole.admin) || hasRole(UpdateRoleDtoRole.superAdmin)
        ? "/admin"
        : "/"
    const redirectTo = getSafeRedirect(searchParams?.get("redirect"), defaultRoute)
    setDidRedirect(true)
    router.push(redirectTo)
  }, [user, didRedirect, hasRole, mustResetPassword, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await login({ email, password })
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* ─── Left: deep herb brand panel ─── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col bg-herb-950 overflow-hidden">
        {/* Dot grid decoration */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #4CAF76 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Decorative large leaf */}
        <div aria-hidden className="absolute bottom-0 right-0 opacity-[0.06] translate-x-16 translate-y-16">
          <Leaf className="w-[420px] h-[420px] text-herb-300" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/ADP.svg" alt="ADP logo" width={32} height={32} className="rounded-lg transition-transform duration-200 group-hover:scale-105" />
            <span className="font-semibold text-herb-100 text-sm tracking-tight">
              Association of Dietetics Professionals
            </span>
          </Link>

          {/* Central copy */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-grain-400 mb-4">
                Member Portal
              </p>
              <h2 className="font-serif text-4xl font-bold text-herb-50 leading-[1.12] mb-4">
                Welcome back to ADP
              </h2>
              <p className="text-herb-400 text-sm leading-relaxed max-w-[280px]">
                India&apos;s professional community for registered dieticians and nutrition scientists.
              </p>
            </div>

            {/* Trust cards */}
            <div className="space-y-3">
              {trustPoints.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 bg-herb-900/70 border border-herb-800 rounded-xl px-4 py-3 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-herb-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-grain-400" />
                  </div>
                  <span className="text-herb-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-herb-800 text-xs">
            &copy; {new Date().getFullYear()} Association of Dietetics Professionals
          </p>
        </div>
      </div>

      {/* ─── Right: form panel ─── */}
      <div
        className={`flex-1 flex items-center justify-center bg-background px-6 py-12 transition-opacity duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Image src="/ADP.svg" alt="ADP logo" width={30} height={30} className="rounded-lg" />
            <span className="font-semibold text-foreground text-sm">ADP</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access your member dashboard, resources, and more.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-border focus:border-primary focus-visible:ring-0 rounded-xl bg-secondary/60 text-foreground placeholder:text-muted-foreground/60 transition-colors duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
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
                  className="h-12 border-border focus:border-primary focus-visible:ring-0 rounded-xl bg-secondary/60 text-foreground pr-11 transition-colors duration-200"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
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

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Not a member yet?{" "}
              <Link
                href="/membership/join"
                className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
              >
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <PageLoading minHeightClassName="min-h-0" direction="column" textClassName="text-sm text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
