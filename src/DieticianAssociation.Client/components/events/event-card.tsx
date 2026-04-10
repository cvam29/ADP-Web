"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventDto } from "@/services/generated"
import { formatCurrency } from "@/lib/currency"

export type EventCardProps = {
  event: EventDto
  href?: string
}

function safePrice(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const n = parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "TBD"
  const d = new Date(dateString)
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function EventCard({ event, href }: EventCardProps) {
  const price = safePrice(event.price as unknown)
  const detailsHref = href || `/events/${event.url || event.id}`

  const cover = Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : undefined

  // Extract date parts for material-like badge
  const dateObj = event.date ? new Date(event.date) : null
  const day = dateObj ? dateObj.getDate() : null
  const month = dateObj ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase() : null

  return (
    <Card className="group overflow-hidden border-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 rounded-xl">
      {/* Cover image with gradient overlay */}
      <div className="relative h-44 w-full bg-gradient-to-br from-emerald-50 to-blue-50 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={event.title || "Event"}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-500 px-6 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                <Calendar className="h-7 w-7" />
              </div>
              <p className="max-w-[16rem] text-sm font-semibold leading-snug line-clamp-2">
                {event.title || "Upcoming Event"}
              </p>
              <p className="mt-1 text-xs text-white/80">
                Association of Dietetics Professionals
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Date tile */}
        {day && month && (
          <div className="absolute left-3 top-3 rounded-md overflow-hidden shadow-md">
            <div className="bg-white/95 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 text-center">{month}</div>
            <div className="bg-emerald-600 text-white text-lg font-bold px-2 py-1 text-center">{day}</div>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute right-3 top-3">
          {price > 0 ? (
            <div className="px-2 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium shadow">
              {formatCurrency(price)}
            </div>
          ) : (
            <div className="px-2 py-1 rounded-md bg-white/90 text-slate-700 text-xs font-medium border">Free</div>
          )}
        </div>

        {/* Bottom info chips */}
        <div className="absolute left-3 bottom-3 right-3 flex items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {event.time && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-medium border">
                <Clock className="h-3 w-3" /> {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-medium border">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {event.type && <Badge variant="secondary" className="bg-white/90 text-slate-800 border">{event.type}</Badge>}
            {event.format && <Badge variant="secondary" className="bg-white/90 text-slate-800 border">{event.format}</Badge>}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="h-3 w-3" /> {formatDate(event.date)}
          </div>
          <Link href={detailsHref} className="ml-auto">
            <Button size="sm">View details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventCard
