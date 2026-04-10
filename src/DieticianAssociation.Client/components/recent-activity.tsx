import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Users, Award } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "event",
    title: 'Attended "Advanced Sports Nutrition" Webinar',
    description: "Earned 2.0 CE credits",
    date: "2024-01-15",
    icon: Calendar,
    badge: "CE Credits",
  },
  {
    id: 2,
    type: "resource",
    title: 'Downloaded "Pediatric Nutrition Guidelines 2024"',
    description: "Added to favorites",
    date: "2024-01-12",
    icon: BookOpen,
    badge: "Resource",
  },
  {
    id: 3,
    type: "networking",
    title: "Connected with Dr. Sarah Johnson",
    description: "New professional connection",
    date: "2024-01-10",
    icon: Users,
    badge: "Network",
  },
  {
    id: 4,
    type: "achievement",
    title: "Completed Nutrition Counseling Course",
    description: "Certificate earned",
    date: "2024-01-08",
    icon: Award,
    badge: "Achievement",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest interactions and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
                    <Badge variant="secondary" className="ml-2">
                      {activity.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.date}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
