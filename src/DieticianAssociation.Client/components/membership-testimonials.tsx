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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Members Say</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hear from nutrition professionals who have advanced their careers through our association.
          </p>
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto md:grid-cols-3 md:auto-rows-fr">
          {loading && publicTestimonials.length === 0 && (
            <div className="md:col-span-3 text-center text-slate-500">Loading testimonials...</div>
          )}
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id ?? index}
              className="group h-full overflow-hidden border-0 bg-white ring-1 ring-slate-200 shadow-md hover:shadow-xl transition-all duration-300 relative rounded-2xl animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-emerald-50 opacity-50 blur-3xl transition-transform duration-500 group-hover:scale-150"></div>
              
              <CardContent className="flex h-full flex-col p-8 relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex bg-amber-50 px-3 py-1 rounded-full">
                    {[...Array(testimonial.rating ?? 0)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-6xl font-serif text-slate-200 opacity-60 leading-none h-8">&ldquo;</span>
                </div>

                <div className={`flex-1 ${TESTIMONIAL_PREVIEW_HEIGHT}`}>
                  <p className="line-clamp-[8] md:line-clamp-6 text-slate-700 font-medium text-lg leading-relaxed">
                    {testimonial.content}
                  </p>
                </div>

                {(testimonial.content?.length ?? 0) > LONG_TESTIMONIAL_THRESHOLD && (
                  <button
                    type="button"
                    onClick={() => setSelectedTestimonial(testimonial)}
                    className="mb-8 mt-4 self-start text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-800 flex items-center gap-1 group-hover:underline"
                  >
                    Read full story
                    <span className="text-xs">→</span>
                  </button>
                )}

                <div className="mt-auto flex items-center space-x-4 border-t border-slate-100 pt-6">
                  <Image
                    src={testimonial.photoUrl || testimonial.submittedBy?.avatar || "/placeholder.svg"}
                    alt={testimonial.memberName || "Member"}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-50"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{testimonial.memberName}</div>
                    <div className="text-sm font-medium text-slate-500 truncate">{testimonial.professionalTitle}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={Boolean(selectedTestimonial)} onOpenChange={(open) => !open && setSelectedTestimonial(null)}>
          <DialogContent className="max-h-[85vh] w-[95vw] sm:max-w-2xl overflow-hidden border-slate-200 p-0">
            {selectedTestimonial && (
              <div className="flex max-h-[85vh] flex-col">
                <DialogHeader className="border-b border-slate-100 px-6 pb-5 pt-6 text-left">
                  <div className="mb-4 flex items-center">
                    {[...Array(selectedTestimonial.rating ?? 0)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-amber-400" />
                    ))}
                  </div>
                  <DialogTitle className="text-2xl text-slate-900">
                    {selectedTestimonial.memberName}
                  </DialogTitle>
                  <DialogDescription className="text-base text-slate-500">
                    {selectedTestimonial.professionalTitle}
                  </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-5">
                  <p className="whitespace-pre-line text-lg italic leading-9 text-slate-700">
                    &ldquo;{selectedTestimonial.content}&rdquo;
                  </p>
                </div>

                <div className="flex items-center space-x-3 border-t border-slate-100 px-6 py-5">
                  <Image
                    src={selectedTestimonial.photoUrl || selectedTestimonial.submittedBy?.avatar || "/placeholder.svg"}
                    alt={selectedTestimonial.memberName || "Member"}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{selectedTestimonial.memberName}</div>
                    <div className="text-sm leading-6 text-slate-500">{selectedTestimonial.professionalTitle}</div>
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
