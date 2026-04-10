"use client"
import { useAuth } from "@/contexts/auth-context"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { usePreventDoubleClick } from "@/hooks/use-debounce"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Calendar, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  MapPin,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"
import { useEventsStore } from "@/store/useEventsStore"
import type { EventDto } from "@/services/generated"

export default function EventsManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const { events, fetchEvents, deleteEvent } = useEventsStore()
  const [isLoading, setIsLoading] = useState(true)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)

  const [debouncedDeleteEvent, isDeleting] = usePreventDoubleClick(async () => {
    if (!deleteEventId) return
    try {
      await deleteEvent(deleteEventId)
      toast.success("Event deleted successfully")
      await loadEvents()
    } catch (error) {
      toast.error("Failed to delete event")
    } finally {
      setDeleteEventId(null)
    }
  }, 1000)

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      await fetchEvents({ page: 1, pageSize: 50 })
    } catch (error) {
      toast.error("Failed to load events")
      console.error("Error loading events:", error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchEvents])

  const mapEventType = (type: string): "workshop" | "webinar" | "conference" | "training" => {
    const normalizedType = type.toLowerCase()
    if (["workshop", "webinar", "conference", "training"].includes(normalizedType)) {
      return normalizedType as "workshop" | "webinar" | "conference" | "training"
    }
    return "workshop"
  }

  const determineEventStatus = (eventDate: string): "upcoming" | "completed" => {
    const now = new Date()
    const eventDateTime = new Date(eventDate)
    return eventDateTime > now ? "upcoming" : "completed"
  }

  useEffect(() => {
    if (!loading) loadEvents()
  }, [loadEvents, loading])

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return (events || []).filter((e) =>
      (e.title || "").toLowerCase().includes(term) ||
      (e.location || "").toLowerCase().includes(term)
    )
  }, [searchTerm, events])

  const handleCreateEvent = () => router.push(`/admin/events/add-edit`)
  const handleEditEvent = (event: EventDto) => {
    if (event.id) router.push(`/admin/events/add-edit?id=${event.id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading events...</span>
        </div>
      </div>
    )
  }
  if (!user) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      workshop: "bg-purple-100 text-purple-800",
      webinar: "bg-green-100 text-green-800",
      conference: "bg-blue-100 text-blue-800",
      training: "bg-orange-100 text-orange-800"
    }
    return <Badge className={colors[type as keyof typeof colors] ?? ""} variant="outline">{type}</Badge>
  }

  const getOccupancyRate = (registered?: number, capacity?: number) => {
    if (!capacity || capacity === 0 || !registered) return 0
    return Math.round((registered / capacity) * 100)
  }

  return (
    <div className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage, monitor, and analyze your organization’s events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadEvents} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <Badge className="ml-2">0</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>A list of all events in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const priceNumber = typeof event.price === 'number' ? event.price : parseFloat(event.price || '0') || 0
                return (
                  <TableRow key={event.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      {priceNumber > 0 ? (
                        <div className="text-sm font-medium text-green-600">₹{priceNumber}</div>
                      ) : (
                        <div className="text-sm text-gray-500">Free</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(event.date || new Date().toISOString())}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(mapEventType(event.type || "workshop"))}</TableCell>
                    <TableCell>{getStatusBadge(determineEventStatus(event.date || ""))}</TableCell>
                    <TableCell className="text-sm">
                      <Users className="inline mr-1 h-4 w-4 text-gray-400" />
                      {event.registered ?? 0}/{event.capacity ?? 0}
                      <div className="text-xs text-gray-500">
                        {getOccupancyRate(event.registered, event.capacity)}% full
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency((priceNumber || 0) * (event.registered || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteEventId(event.id as string)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          </div>

          {filteredEvents.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first event."}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateEvent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the event and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={debouncedDeleteEvent} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
