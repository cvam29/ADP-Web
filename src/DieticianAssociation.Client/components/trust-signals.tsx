"use client"

import { useEffect, useRef, useState } from "react"
import { useReveal } from "@/hooks/use-reveal"

const stats = [
  { value: 5000, suffix: "+", label: "Active Members",       sub: "across India" },
  { value: 15,   suffix: "+", label: "Years of Excellence",  sub: "since 2009" },
  { value: 50,   suffix: "+", label: "Events Per Year",      sub: "workshops & conferences" },
  { value: 98,   suffix: "%", label: "Member Satisfaction",  sub: "independently verified" },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1600
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current = Math.min(current + increment, target)
            setCount(Math.floor(current))
            if (current >= target) clearInterval(timer)
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function TrustSignals() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-20 bg-primary"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <p className="reveal text-center text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-12">
          Trusted by professionals across India
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-primary-foreground/20">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`reveal reveal-delay-${i + 1} flex flex-col items-center text-center px-6`}
            >
              <span className="text-4xl sm:text-5xl font-serif font-bold text-primary-foreground leading-none mb-2">
                <Counter target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-sm font-semibold text-primary-foreground/90 mb-0.5">{stat.label}</span>
              <span className="text-xs text-primary-foreground/50">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
