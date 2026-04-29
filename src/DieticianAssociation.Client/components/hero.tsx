"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Leaf, ShieldCheck, BookOpen } from "lucide-react"

const badges = [
  { icon: Leaf,        label: "Nutrition Advocacy" },
  { icon: ShieldCheck, label: "Govt. Registered Body" },
  { icon: BookOpen,    label: "Continuing Education" },
]

export function Hero() {
  const contentRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll<HTMLElement>("[data-animate]")
    if (!items) return
    items.forEach((el, i) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(24px)"
      const delay = i * 120
      const timer = setTimeout(() => {
        el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
        el.style.opacity = "1"
        el.style.transform = "none"
      }, 80)
      return () => clearTimeout(timer)
    })

    // Image fade-in
    const img = imageRef.current
    if (img) {
      img.style.opacity = "0"
      img.style.transform = "translateX(24px) scale(0.98)"
      setTimeout(() => {
        img.style.transition = "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 300ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 300ms"
        img.style.opacity = "1"
        img.style.transform = "none"
      }, 80)
    }
  }, [])

  return (
    <section className="relative bg-background border-b border-border overflow-hidden">
      {/* Subtle textured background dot pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #2D7A4F 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="container mx-auto px-4 lg:px-6 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Content column */}
          <div ref={contentRef} className="flex-1 space-y-7 max-w-xl lg:max-w-none">

            {/* Eyebrow */}
            <div data-animate className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/8 border border-primary/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                India&apos;s Dietetics Community
              </span>
            </div>

            {/* Heading */}
            <div data-animate className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-serif font-bold text-foreground leading-[1.08] tracking-tight text-balance">
                Empowering{" "}
                <span className="relative whitespace-nowrap">
                  Nutrition
                  <svg
                    aria-hidden
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 220 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 7.5 Q55 2 110 6 Q165 10 218 4"
                      stroke="hsl(33 54% 49%)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                Professionals
              </h1>
              <p data-animate className="text-lg text-muted-foreground leading-relaxed">
                Join a thriving community of registered dieticians and nutritionists advancing the science of nutrition and improving public health across India.
              </p>
            </div>

            {/* CTAs */}
            <div data-animate className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-7 shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                <Link href="/membership/join">
                  Join ADP Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-border text-foreground hover:bg-secondary px-7 transition-all duration-200"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div data-animate className="flex flex-wrap gap-2 pt-1">
              {badges.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border px-3.5 py-2 rounded-full"
                >
                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div ref={imageRef} className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-herb-500/10">
              <Image
                src="https://adpblobstorage.blob.core.windows.net/adpcontainer/Assets/Adp_homepage_new_4e43aea799.jpeg"
                alt="Nutrition professionals collaborating at Association of Dietetics Professionals"
                width={680}
                height={620}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
                priority
              />
              {/* Subtle overlay to deepen bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-transparent" />
            </div>

            {/* Floating stat card — member satisfaction */}
            <div className="absolute -bottom-4 -left-4 lg:-left-8 bg-card border border-border rounded-2xl shadow-xl p-4 min-w-[140px] animate-fade-in">
              <p className="text-2xl font-serif font-bold text-primary leading-none">98%</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">Member Satisfaction</p>
            </div>

            {/* Floating stat card — members */}
            <div className="hidden sm:flex absolute -top-4 -right-4 lg:-right-6 flex-col bg-card border border-border rounded-2xl shadow-xl p-4 min-w-[130px] animate-fade-in [animation-delay:200ms]">
              <p className="text-2xl font-serif font-bold text-foreground leading-none">50<span className="text-primary">+</span></p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">Active Members</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
