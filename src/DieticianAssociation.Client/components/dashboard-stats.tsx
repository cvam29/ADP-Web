"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, BookOpen, Users, Award } from "lucide-react"

export function DashboardStats() {
  const { user } = useAuth()
  const membershipStatus = user?.membership?.status ?? "Unknown"
  const membershipTier = user?.membership?.tier ?? "Member"
  const joinDate = user?.membership?.joinDate
  const memberSince = joinDate ? new Date(joinDate).toLocaleDateString() : "an unknown date"

  const stats = [
    {
      title: "Membership Status",
      value: membershipStatus,
      description: `${membershipTier} member since ${memberSince}`,
      icon: Users,
      color: "text-emerald-600",
    },
    {
      title: "CE Credits",
      value: "24.5",
      description: "15.5 credits remaining for renewal",
      icon: Award,
      color: "text-blue-600",
    },
    {
      title: "Events Attended",
      value: "12",
      description: "3 upcoming events registered",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Resources Accessed",
      value: "89",
      description: "15 resources saved to favorites",
      icon: BookOpen,
      color: "text-amber-600",
    },
  ]

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-1">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.title === "Membership Status" && (
                  <Badge className={getMembershipStatusColor(membershipStatus.toLowerCase())}>
                    {membershipStatus}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.title === "CE Credits" && <Progress value={61} className="mt-2" />}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
