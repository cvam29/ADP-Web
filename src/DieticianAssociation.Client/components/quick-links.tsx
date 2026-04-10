"use client"

import { Button } from "@/components/ui/button"
import { Users, Calendar, BookOpen, PenTool, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useReveal } from "@/hooks/use-reveal"

const quickLinks = [
  {
    title: "Membership",
    description: "Join our community of nutrition professionals and access exclusive benefits.",
    icon: Users,
    href: "/membership",
    accent: "bg-herb-50 dark:bg-herb-950/40 border-herb-200 dark:border-herb-800",
    iconBg: "bg-herb-100 dark:bg-herb-900",
    iconColor: "text-primary",
  },
  {
    title: "Events",
    description: "Webinars, conferences, and hands-on workshops for continuing education.",
    icon: Calendar,
    href: "/events",
    accent: "bg-grain-50 dark:bg-grain-900/20 border-grain-200 dark:border-grain-800",
    iconBg: "bg-grain-100 dark:bg-grain-900",
    iconColor: "text-accent",
  },
  {
    title: "Resources",
    description: "Research papers, clinical tools, and professional reference materials.",
    icon: BookOpen,
    href: "/resources",
    accent: "bg-herb-50 dark:bg-herb-950/40 border-herb-200 dark:border-herb-800",
    iconBg: "bg-herb-100 dark:bg-herb-900",
    iconColor: "text-primary",
  },
  {
    title: "Blog",
    description: "Expert insights, nutrition research updates, and industry news.",
    icon: PenTool,
    href: "/blog",
    accent: "bg-grain-50 dark:bg-grain-900/20 border-grain-200 dark:border-grain-800",
    iconBg: "bg-grain-100 dark:bg-grain-900",
    iconColor: "text-accent",
  },
]

export function QuickLinks() {
  const ref = useReveal()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 bg-background"
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section heading */}
        <div className="reveal max-w-2xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            What We Offer
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Access professional resources, connect with peers, and advance your career in nutrition science.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickLinks.map((link, i) => {
            const Icon = link.icon
            return (
              <Link
                key={link.title}
                href={link.href}
                className={`reveal reveal-delay-${i + 1} group flex flex-col border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 ${link.accent}`}
              >
                <div className={`w-11 h-11 rounded-xl ${link.iconBg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${link.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{link.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">{link.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all duration-200">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
