"use client"

import { startTransition, useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star } from "lucide-react"
import Image from "next/image"
import { useTestimonialStore } from "@/store/useTestimonialStore"
import type { TestimonialDto } from "@/services/generated"
import { streamTestimonials } from "@/lib/content-stream"

const LONG_TESTIMONIAL_THRESHOLD = 280
const TESTIMONIAL_PREVIEW_HEIGHT = "md:h-[17rem]"

const fallbackTestimonials: TestimonialDto[] = [
  {
    id: "fallback-1",
    memberName: "Dr. Priya Menon, RD",
    professionalTitle: "Clinical Nutritionist",
    photoUrl: "/placeholder.svg?height=80&width=80",
    content:
      "The resources and networking opportunities have been invaluable for my practice in India. The continuing education programs keep me at the forefront of evolving nutrition science.",
    rating: 5,
  },
  {
    id: "fallback-2",
    memberName: "Rohit Sharma, RD",
    professionalTitle: "Sports Nutritionist",
    photoUrl: "/placeholder.svg?height=80&width=80",
    content:
      "Being part of this association has opened doors I never imagined. The mentorship program connected me with leading experts who guided my career in sports nutrition.",
    rating: 5,
  },
  {
    id: "fallback-3",
    memberName: "Ananya Iyer, RD",
    professionalTitle: "Pediatric Nutritionist",
    photoUrl: "/placeholder.svg?height=80&width=80",
    content:
      "The research database and clinical tools have transformed the way I work with children and their families. The quality and relevance of resources to Indian context is exceptional.",
    rating: 5,
  },
]

export function MembershipTestimonials() {
  const { fetchPublicTestimonials } = useTestimonialStore()
  const [publicTestimonials, setPublicTestimonials] = useState<TestimonialDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialDto | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadTestimonials = useCallback(async () => {
    abortRef.current?.abort()
    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      setLoading(true)
      setPublicTestimonials([])

      await streamTestimonials(
        {
          page: 1,
          pageSize: 3,
          featured: true,
          sortBy: "submittedAt",
          sortDirection: "desc",
        },
        {
          signal: abortController.signal,
          onMeta: () => {
            setLoading(false)
          },
          onItem: (testimonial) => {
            startTransition(() => {
              setPublicTestimonials((prev) => [...prev, testimonial])
              setLoading(false)
            })
          },
        },
      )
    } catch (streamError) {
      if (abortController.signal.aborted) {
        return
      }

      try {
        const result = await fetchPublicTestimonials({
          page: 1,
          pageSize: 3,
          filters: { isFeatured: true },
          sortBy: "submittedAt",
          sortDirection: "desc",
        })

        setPublicTestimonials((result.items ?? []) as unknown as TestimonialDto[])
      } finally {
        setLoading(false)
      }
    } finally {
      if (abortRef.current === abortController) {
        abortRef.current = null
      }
    }
  }, [fetchPublicTestimonials])

  useEffect(() => {
    void loadTestimonials()

    return () => {
      abortRef.current?.abort()
    }
  }, [loadTestimonials])

  const testimonials: TestimonialDto[] =
    publicTestimonials.length > 0 ? (publicTestimonials as unknown as TestimonialDto[]) : fallbackTestimonials

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Testimonials</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">What Our Members Say</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hear from nutrition professionals who have advanced their careers through our association.
          </p>
        </div>

        <div className="grid gap-6 max-w-6xl mx-auto md:grid-cols-3 md:auto-rows-fr">
          {loading && publicTestimonials.length === 0 && (
            <div className="md:col-span-3 text-center text-muted-foreground">Loading testimonials...</div>
          )}
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id ?? index}
              className="group h-full overflow-hidden border-border bg-card hover:border-primary/30 transition-colors duration-150 relative rounded-2xl animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
            >
              <CardContent className="flex h-full flex-col p-7 relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating ?? 0)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-current" />
                    ))}
                  </div>
                  <span className="text-5xl font-serif text-muted-foreground/20 leading-none h-8">&ldquo;</span>
                </div>

                <div className={`flex-1 ${TESTIMONIAL_PREVIEW_HEIGHT}`}>
                  <p className="line-clamp-[8] md:line-clamp-6 text-foreground/80 text-base leading-relaxed">
                    {testimonial.content}
                  </p>
                </div>

                {(testimonial.content?.length ?? 0) > LONG_TESTIMONIAL_THRESHOLD && (
                  <button
                    type="button"
                    onClick={() => setSelectedTestimonial(testimonial)}
                    className="mb-6 mt-4 self-start text-sm font-semibold text-primary transition-colors hover:text-primary/80 flex items-center gap-1"
                  >
                    Read full story
                    <span className="text-xs">→</span>
                  </button>
                )}

                <div className="mt-auto flex items-center gap-4 border-t border-border pt-5">
                  <Image
                    src={testimonial.photoUrl || testimonial.submittedBy?.avatar || "/placeholder.svg"}
                    alt={testimonial.memberName || "Member"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground truncate text-sm">{testimonial.memberName}</div>
                    <div className="text-xs text-muted-foreground truncate">{testimonial.professionalTitle}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={Boolean(selectedTestimonial)} onOpenChange={(open) => !open && setSelectedTestimonial(null)}>
          <DialogContent className="max-h-[85vh] w-[95vw] sm:max-w-2xl overflow-hidden border-border bg-card p-0">
            {selectedTestimonial && (
              <div className="flex max-h-[85vh] flex-col">
                <DialogHeader className="border-b border-border px-6 pb-5 pt-6 text-left">
                  <div className="mb-4 flex items-center gap-0.5">
                    {[...Array(selectedTestimonial.rating ?? 0)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-accent" />
                    ))}
                  </div>
                  <DialogTitle className="text-2xl text-foreground">
                    {selectedTestimonial.memberName}
                  </DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground">
                    {selectedTestimonial.professionalTitle}
                  </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-5">
                  <p className="whitespace-pre-line text-base italic leading-8 text-foreground/80">
                    &ldquo;{selectedTestimonial.content}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-border px-6 py-5">
                  <Image
                    src={selectedTestimonial.photoUrl || selectedTestimonial.submittedBy?.avatar || "/placeholder.svg"}
                    alt={selectedTestimonial.memberName || "Member"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground text-sm">{selectedTestimonial.memberName}</div>
                    <div className="text-xs text-muted-foreground">{selectedTestimonial.professionalTitle}</div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
