'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import DashboardSwitcher from '@/components/dashboard-switcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar,
  Award,
  CreditCard,
  Bell,
  TrendingUp,
  CheckCircle,
  GraduationCap,
  MessageSquareQuote,
} from 'lucide-react'
import {
  EventRegistration,
  NotificationDto,
  AssociationEvent,
  RegistrationStatus,
} from '@/types/api'
import type { CertificateDto } from '@/services/generated'
import { eventRegistrationApi, certificateApi, notificationApi, eventsApi } from '@/lib/services'
import { useAuth } from '@/contexts/auth-context'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { ADPSpinner } from '@/components/ui/adp-spinner'

export function UserDashboard() {
  const { user, hasActiveMembership, hasPermission } = useAuth()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [certificates, setCertificates] = useState<CertificateDto[]>([])
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const [userRegistrations, userCertificates, userNotifications] = await Promise.allSettled([
        eventRegistrationApi.getUserRegistrations(user.id),
        certificateApi.getUserCertificates().catch(() => []),
        notificationApi.getUserNotifications(user.id, 1, 10),
      ])
      if (userRegistrations.status === 'fulfilled') setRegistrations(userRegistrations.value)
      if (userCertificates.status === 'fulfilled') setCertificates(userCertificates.value)
      if (userNotifications.status === 'fulfilled') setNotifications(userNotifications.value)
    } catch {
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [toast, user?.id])

  useEffect(() => {
    if (user?.id) loadDashboardData()
  }, [loadDashboardData, user?.id])

  const confirmed = registrations.filter(
    (r) => r.registrationStatus === RegistrationStatus.Confirmed,
  ).length
  const pending = registrations.filter(
    (r) => r.registrationStatus === RegistrationStatus.Pending,
  ).length
  const completed = registrations.filter(
    (r) => r.registrationStatus === RegistrationStatus.Completed,
  ).length
  const unreadNotifications = notifications.filter((n) => !n.isRead).length

  const recentActivity = [
    ...registrations.map((r) => ({
      id: r.id,
      type: 'registration' as const,
      title: `Registered for ${r.eventTitle}`,
      description: `Event registration ${r.registrationStatus.toLowerCase()}`,
      date: r.eventDate,
      status: r.registrationStatus,
    })),
    ...certificates.map((c) => ({
      id: c.certificateNumber ?? '',
      type: 'certificate' as const,
      title: 'Certificate earned',
      description: c.memberShipName ?? c.participantName ?? 'Certificate',
      date: c.issueDate ?? '',
      status: 'valid',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <ADPSpinner size="md" />
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardSwitcher />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Registrations',
            value: confirmed,
            sub: pending > 0 ? `${pending} pending` : 'All confirmed',
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Certificates Earned',
            value: certificates.length,
            sub: `${certificates.length} CE credits`,
            icon: Award,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Total Registrations',
            value: registrations.length,
            sub: 'Across all events',
            icon: CreditCard,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            label: 'Unread Notifications',
            value: unreadNotifications,
            sub: 'New messages',
            icon: Bell,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{stat.sub}</p>
                  </div>
                  <div
                    className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      stat.bg,
                    )}
                  >
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-7 px-2" asChild>
                <Link href="/dashboard/events">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                      </p>
                    </div>
                    {activity.type === 'registration' ? (
                      <Badge
                        variant={
                          activity.status === RegistrationStatus.Confirmed ? 'default' : 'secondary'
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {activity.status === RegistrationStatus.Confirmed ? 'Confirmed' : 'Pending'}
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs flex-shrink-0">
                        Valid
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress + Membership */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">Certificate Library</span>
                  <span className="text-gray-500">{certificates.length}</span>
                </div>
                <Progress value={certificates.length > 0 ? 100 : 0} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">
                  {certificates.length} certificates in library
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">Events Completed</span>
                  <span className="text-gray-500">
                    {completed}/{registrations.length}
                  </span>
                </div>
                <Progress
                  value={
                    registrations.length > 0 ? (completed / registrations.length) * 100 : 0
                  }
                  className="h-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {completed} of {registrations.length} events completed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Membership Status</p>
                  <p className="text-xs text-emerald-600">
                    {hasActiveMembership() ? 'Active member' : 'No active membership'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {hasActiveMembership() && hasPermission('member.tools.access') ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    asChild
                  >
                    <Link href="/dashboard/tools">Open Tools</Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs flex-1 bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <Link href="/membership">View Plans</Link>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  asChild
                >
                  <Link href="/profile">My Profile</Link>
                </Button>
              </div>
              {hasActiveMembership() ? (
                <div className="mt-3 rounded-xl border border-emerald-200/80 bg-white/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Share your member story</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        Submit a testimonial for admin review and public publishing.
                      </p>
                    </div>
                    <MessageSquareQuote className="h-4 w-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-xs"
                    asChild
                  >
                    <Link href="/dashboard/testimonials">Submit testimonial</Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
