'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { eventRegistrationApi } from '@/lib/services'
import { useAuth } from '@/contexts/auth-context'
import { EventRegistration, RegistrationStatus } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { ADPSpinner } from '@/components/ui/adp-spinner'

function EventsContent() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!user?.id) return
    setIsLoading(true)
    eventRegistrationApi
      .getUserRegistrations(user.id)
      .then(setRegistrations)
      .catch(() =>
        toast({ title: 'Error', description: 'Failed to load registrations', variant: 'error' }),
      )
      .finally(() => setIsLoading(false))
  }, [toast, user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <ADPSpinner size="sm" />
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="text-center py-14">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-800 mb-1">No registrations yet</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Browse upcoming events and register to start your learning journey.
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <a href="/dashboard/discover">Browse Events</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {registrations.map((registration) => (
        <Card key={registration.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{registration.eventTitle}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(registration.eventDate), { addSuffix: true })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      registration.registrationStatus === RegistrationStatus.Confirmed
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {registration.registrationStatus}
                  </Badge>
                  {registration.registrationStatus === RegistrationStatus.Completed && (
                    <Badge className="text-xs bg-green-100 text-green-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  View Details
                </Button>
                {registration.registrationStatus === RegistrationStatus.Confirmed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 hover:text-red-700 border-red-100"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  )
}
