"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Image as ImageIcon,
  Video,
  Download,
  Upload,
  Star
} from "lucide-react"
import { formatNumber } from "@/lib/currency"

interface ContentItem {
  id: string
  title: string
  type: "resource" | "page" | "media"
  status: "published" | "draft" | "archived"
  author: string
  createdAt: string
  updatedAt: string
  views?: number
  rating?: number
}

export default function ContentManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/unauthorized")
    }
  }, [user, loading, router])

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: "2",
        title: "Dietary Guidelines 2024",
        type: "resource",
        status: "published",
        author: "Admin",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-25",
        views: 1923,
        rating: 4.6
      },
      {
        id: "3",
        title: "Membership Benefits Page",
        type: "page",
        status: "draft",
        author: "Mike Wilson",
        createdAt: "2024-01-22",
        updatedAt: "2024-01-22",
      },
      {
        id: "4",
        title: "Nutrition Chart Infographic",
        type: "media",
        status: "published",
        author: "Design Team",
        createdAt: "2024-01-18",
        updatedAt: "2024-01-19",
        views: 1456
      },
      {
        id: "5",
        title: "Meal Planning Workshop Video",
        type: "media",
        status: "published",
        author: "Training Team",
        createdAt: "2024-01-12",
        updatedAt: "2024-01-12",
        views: 3241,
        rating: 4.9
      },
      {
        id: "6",
        title: "Nutrition Research Papers",
        type: "resource",
        status: "published",
        author: "Research Team",
        createdAt: "2024-01-08",
        updatedAt: "2024-01-20",
        views: 1876,
        rating: 4.7
      },
      {
        id: "7",
        title: "Contact Us Page",
        type: "page",
        status: "published",
        author: "Admin",
        createdAt: "2024-01-05",
        updatedAt: "2024-01-15",
        views: 987
      },
      {
        id: "8",
        title: "Educational Webinar Recording",
        type: "media",
        status: "archived",
        author: "Education Team",
        createdAt: "2023-12-20",
        updatedAt: "2024-01-10",
        views: 2156
      }
    ]
    setContent(mockContent)
    setFilteredContent(mockContent)
  }, [])

  useEffect(() => {
    let filtered = content.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.type === activeTab)
    }

    setFilteredContent(filtered)
  }, [searchTerm, activeTab, content])

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
      case "published":
        return <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">Published</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200" variant="outline">Draft</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200" variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "resource":
        return <BookOpen className="w-4 h-4" />
      case "page":
        return <FileText className="w-4 h-4" />
      case "media":
        return <ImageIcon className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const stats = [
    { 
      name: "Total Content", 
      value: content.length.toString(), 
      icon: FileText, 
      color: "bg-blue-500" 
    },
    { 
      name: "Published", 
      value: content.filter(c => c.status === "published").length.toString(), 
      icon: Eye, 
      color: "bg-green-500" 
    },
    { 
      name: "Drafts", 
      value: content.filter(c => c.status === "draft").length.toString(), 
      icon: Edit, 
      color: "bg-yellow-500" 
    },
    { 
      name: "Media Files", 
      value: content.filter(c => c.type === "media").length.toString(), 
      icon: ImageIcon, 
      color: "bg-purple-500" 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground">Manage resources, pages, and media files</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Content
          </Button>
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

      {/* Content Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>Manage resources, pages, and media files in one place</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="resource">Resources</TabsTrigger>
              <TabsTrigger value="page">Pages</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(item.type)}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">ID: {item.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.author}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {item.views && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              {formatNumber(item.views)}
                            </div>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {item.rating}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString()}
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
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </DropdownMenuItem>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Create Blog Post
            </CardTitle>
            <CardDescription>Write and publish a new blog article</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Add Resource
            </CardTitle>
            <CardDescription>Upload educational materials and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Resource
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Media Library
            </CardTitle>
            <CardDescription>Manage images, videos, and documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Browse Media
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
