"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Leaf } from "lucide-react"
import { useReveal } from "@/hooks/use-reveal"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const ref = useReveal()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative py-24 bg-herb-950 overflow-hidden"
    >
      {/* Decorative dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #4CAF76 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative leaf */}
      <div aria-hidden className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-5">
        <Leaf className="w-80 h-80 text-herb-300" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="max-w-xl mx-auto text-center">
          <span className="reveal inline-block text-xs font-semibold uppercase tracking-widest text-grain-400 mb-5">
            Stay in the Loop
          </span>
          <h2 className="reveal font-serif text-3xl sm:text-4xl font-bold text-herb-50 tracking-tight mb-4">
            The Nutrition Digest
          </h2>
          <p className="reveal text-herb-300 text-base leading-relaxed mb-10">
            Get the latest nutrition research, professional updates, and exclusive member content — delivered straight to your inbox. No spam, ever.
          </p>

          {submitted ? (
            <div className="reveal flex flex-col items-center gap-3 py-6">
              <div className="w-12 h-12 rounded-full bg-herb-800 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-herb-300" />
              </div>
              <p className="text-herb-200 font-medium">You&apos;re subscribed! Welcome to the community.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="reveal flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-herb-900 border-herb-700 text-herb-50 placeholder:text-herb-500 focus:border-herb-400 focus-visible:ring-0 rounded-full px-5 h-12"
              />
              <Button
                type="submit"
                className="rounded-full bg-grain-500 hover:bg-grain-400 text-white px-6 shrink-0 h-12 gap-2 shadow-lg shadow-grain-900/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          <p className="reveal text-herb-700 text-xs mt-5">
            Join 5,000+ nutrition professionals already subscribed.
          </p>
        </div>
      </div>
    </section>
  )
}
