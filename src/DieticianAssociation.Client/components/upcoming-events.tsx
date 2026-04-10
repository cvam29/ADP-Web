import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Clinical Nutrition Update",
    date: "2024-02-15",
    time: "2:00 PM EST",
    type: "Webinar",
    credits: "1.5 CE",
    location: "Online",
  },
  {
    id: 2,
    title: "Annual Nutrition Conference",
    date: "2024-03-20",
    time: "9:00 AM EST",
    type: "Conference",
    credits: "8.0 CE",
    location: "Chicago, IL",
  },
  {
    id: 3,
    title: "Pediatric Nutrition Workshop",
    date: "2024-02-28",
    time: "1:00 PM EST",
    type: "Workshop",
    credits: "3.0 CE",
    location: "Online",
  },
]

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Events you&rsquo;re registered for</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{event.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {event.credits}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {event.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          View All Events
        </Button>
      </CardContent>
    </Card>
  )
}
