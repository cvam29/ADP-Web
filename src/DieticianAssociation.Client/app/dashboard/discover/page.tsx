'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { eventsApi } from '@/lib/services'
import { AssociationEvent } from '@/types/api'
import { EventCard } from '@/components/events/event-card'
import { useToast } from '@/hooks/use-toast'
import { ADPSpinner } from '@/components/ui/adp-spinner'
import Link from 'next/link'

function DiscoverContent() {
  const [events, setEvents] = useState<AssociationEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    eventsApi
      .getUpcoming()
      .then(setEvents)
      .catch(() =>
        toast({ title: 'Error', description: 'Failed to load events', variant: 'error' }),
      )
      .finally(() => setIsLoading(false))
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <ADPSpinner size="sm" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{events.length} upcoming events</p>
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <Link href="/events">View all events</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-14">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming events found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {events.slice(0, 12).map((event) => (
            <EventCard key={event.id} event={event} href={`/events/${event.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <ProtectedRoute>
      <DiscoverContent />
    </ProtectedRoute>
  )
}
