"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Bell, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Send,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { formatNumber } from "@/lib/currency"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  priority: "low" | "medium" | "high" | "urgent"
  target: "all" | "admins" | "members" | "specific"
  status: "draft" | "scheduled" | "sent" | "failed"
  scheduledDate?: string
  sentDate?: string
  recipientCount?: number
  openRate?: number
  createdBy: string
  createdAt: string
}

export default function NotificationsManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info" as const,
    priority: "medium" as const,
    target: "all" as const,
    scheduledDate: ""
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/unauthorized")
    }
  }, [user, loading, router])

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "System Maintenance Scheduled",
        message: "The platform will undergo scheduled maintenance on February 25th from 2:00 AM to 4:00 AM EST.",
        type: "warning",
        priority: "high",
        target: "all",
        status: "sent",
        sentDate: "2024-01-20T10:00:00Z",
        recipientCount: 1247,
        openRate: 78,
        createdBy: "Admin System",
        createdAt: "2024-01-20T09:30:00Z"
      },
      {
        id: "2",
        title: "New Course Available: Advanced Nutrition",
        message: "We're excited to announce a new advanced nutrition course is now available for enrollment.",
        type: "success",
        priority: "medium",
        target: "members",
        status: "sent",
        sentDate: "2024-01-18T14:00:00Z",
        recipientCount: 892,
        openRate: 65,
        createdBy: "Dr. Sarah Johnson",
        createdAt: "2024-01-18T13:00:00Z"
      },
      {
        id: "3",
        title: "Certificate Renewal Reminder",
        message: "Your professional certification expires in 30 days. Please renew to maintain your active status.",
        type: "warning",
        priority: "high",
        target: "specific",
        status: "scheduled",
        scheduledDate: "2024-02-01T09:00:00Z",
        recipientCount: 156,
        createdBy: "Mike Wilson",
        createdAt: "2024-01-22T11:00:00Z"
      },
      {
        id: "4",
        title: "Welcome to New Members",
        message: "Welcome message for new platform members with getting started information.",
        type: "info",
        priority: "low",
        target: "specific",
        status: "draft",
        createdBy: "Admin Team",
        createdAt: "2024-01-24T16:00:00Z"
      },
      {
        id: "5",
        title: "Payment Processing Error",
        message: "There was an issue processing some membership payments. Please check your billing information.",
        type: "error",
        priority: "urgent",
        target: "specific",
        status: "failed",
        recipientCount: 23,
        createdBy: "Billing System",
        createdAt: "2024-01-25T08:00:00Z"
      }
    ]
    setNotifications(mockNotifications)
    setFilteredNotifications(mockNotifications)
  }, [])

  useEffect(() => {
    const filtered = notifications.filter(
      (notification) =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredNotifications(filtered)
  }, [searchTerm, notifications])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800"
    }
    return <Badge className={colors[type as keyof typeof colors]} variant="outline">{type}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    }
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "draft":
        return <Edit className="w-4 h-4 text-gray-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const handleCreateNotification = () => {
    // Here you would typically send the notification to your API
    //console.log("Creating notification:", newNotification)
    setIsCreateDialogOpen(false)
    setNewNotification({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      target: "all",
      scheduledDate: ""
    })
  }

  const stats = [
    { 
      name: "Total Notifications", 
      value: notifications.length.toString(), 
      icon: Bell, 
      color: "bg-blue-500" 
    },
    { 
      name: "Sent", 
      value: notifications.filter(n => n.status === "sent").length.toString(), 
      icon: CheckCircle, 
      color: "bg-green-500" 
    },
    { 
      name: "Scheduled", 
      value: notifications.filter(n => n.status === "scheduled").length.toString(), 
      icon: Clock, 
      color: "bg-blue-500" 
    },
    { 
      name: "Avg. Open Rate", 
      value: `${Math.round(notifications.filter(n => n.openRate).reduce((sum, n) => sum + (n.openRate || 0), 0) / notifications.filter(n => n.openRate).length || 0)}%`, 
      icon: Eye, 
      color: "bg-purple-500" 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications Management</h1>
          <p className="text-muted-foreground">Send and manage platform notifications</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to users on the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newNotification.type} onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newNotification.priority} onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select value={newNotification.target} onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, target: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Schedule Date (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={newNotification.scheduledDate}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNotification}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Manage sent and scheduled notifications</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        By {notification.createdBy} • {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell>{getPriorityBadge(notification.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="text-sm capitalize">{notification.target}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {notification.recipientCount && (
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatNumber(notification.recipientCount)} recipients
                        </div>
                        {notification.openRate && (
                          <div className="text-sm text-muted-foreground">
                            {notification.openRate}% open rate
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.status)}
                      {getStatusBadge(notification.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2">
                          <Eye className="w-4 h-4" />
                          View details
                        </DropdownMenuItem>
                        {notification.status === "draft" && (
                          <>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" />
                              Edit notification
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Send className="w-4 h-4" />
                              Send now
                            </DropdownMenuItem>
                          </>
                        )}
                        {notification.status === "scheduled" && (
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Reschedule
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>Use predefined notification templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">System Alert</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Bell className="w-5 h-5" />
              <span className="text-sm">Event Reminder</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Welcome Message</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Renewal Notice</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
