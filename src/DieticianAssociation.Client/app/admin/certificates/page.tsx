"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { PageLoading } from "@/components/page-loading"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Award, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Calendar
} from "lucide-react"

interface Certificate {
  id: string
  title: string
  type: "completion" | "achievement" | "professional" | "continuing_education"
  recipient: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  issuedDate: string
  expiryDate?: string
  status: "active" | "expired" | "revoked" | "pending"
  course?: string
  credits?: number
  verificationCode: string
  issuedBy: string
}

export default function CertificatesManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/unauthorized")
    }
  }, [user, loading, router])

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCertificates: Certificate[] = [
      {
        id: "1",
        title: "Nutrition Fundamentals Certification",
        type: "completion",
        recipient: {
          id: "u1",
          name: "John Smith",
          email: "john.smith@example.com"
        },
        issuedDate: "2024-01-15",
        expiryDate: "2026-01-15",
        status: "active",
        course: "Nutrition Fundamentals Workshop",
        credits: 10,
        verificationCode: "NFC-2024-001",
        issuedBy: "Dr. Sarah Johnson"
      },
      {
        id: "2",
        title: "Advanced Diet Planning Certificate",
        type: "professional",
        recipient: {
          id: "u2",
          name: "Emily Davis",
          email: "emily.davis@example.com"
        },
        issuedDate: "2024-01-20",
        expiryDate: "2027-01-20",
        status: "active",
        course: "Advanced Diet Planning Course",
        credits: 15,
        verificationCode: "ADP-2024-002",
        issuedBy: "Mike Wilson"
      },
      {
        id: "3",
        title: "Pediatric Nutrition Specialist",
        type: "achievement",
        recipient: {
          id: "u3",
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com"
        },
        issuedDate: "2023-12-10",
        expiryDate: "2025-12-10",
        status: "active",
        course: "Pediatric Nutrition Training",
        credits: 20,
        verificationCode: "PNS-2023-045",
        issuedBy: "Dr. Emily Davis"
      },
      {
        id: "4",
        title: "Continuing Education - 2023",
        type: "continuing_education",
        recipient: {
          id: "u4",
          name: "Mike Wilson",
          email: "mike.wilson@example.com"
        },
        issuedDate: "2023-12-31",
        status: "expired",
        credits: 25,
        verificationCode: "CE-2023-078",
        issuedBy: "Admin System"
      },
      {
        id: "5",
        title: "Sports Nutrition Certificate",
        type: "professional",
        recipient: {
          id: "u5",
          name: "Alex Brown",
          email: "alex.brown@example.com"
        },
        issuedDate: "2024-01-25",
        status: "pending",
        course: "Sports Nutrition Workshop",
        credits: 12,
        verificationCode: "SN-2024-003",
        issuedBy: "Training Team"
      }
    ]
    setCertificates(mockCertificates)
    setFilteredCertificates(mockCertificates)
  }, [])

  useEffect(() => {
    const filtered = certificates.filter(
      (cert) =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.verificationCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCertificates(filtered)
  }, [searchTerm, certificates])

  if (loading) {
    return <PageLoading direction="column" message="Loading certificates..." />;
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">Active</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200" variant="outline">Expired</Badge>
      case "revoked":
        return <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">Revoked</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      completion: "bg-blue-100 text-blue-800",
      achievement: "bg-purple-100 text-purple-800",
      professional: "bg-green-100 text-green-800",
      continuing_education: "bg-orange-100 text-orange-800"
    }
    const labels = {
      completion: "Completion",
      achievement: "Achievement", 
      professional: "Professional",
      continuing_education: "CE Credits"
    }
    return (
      <Badge className={colors[type as keyof typeof colors]} variant="outline">
        {labels[type as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "expired":
        return <Clock className="w-4 h-4 text-gray-500" />
      case "revoked":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const isExpiring = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 && diffDays > 0 // Expiring within 90 days
  }

  const stats = [
    { 
      name: "Total Certificates", 
      value: certificates.length.toString(), 
      icon: Award, 
      color: "bg-blue-500" 
    },
    { 
      name: "Active", 
      value: certificates.filter(c => c.status === "active").length.toString(), 
      icon: CheckCircle, 
      color: "bg-green-500" 
    },
    { 
      name: "Expiring Soon", 
      value: certificates.filter(c => isExpiring(c.expiryDate)).length.toString(), 
      icon: Clock, 
      color: "bg-yellow-500" 
    },
    { 
      name: "Total Credits", 
      value: certificates.reduce((sum, c) => sum + (c.credits || 0), 0).toString(), 
      icon: Calendar, 
      color: "bg-purple-500" 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificates Management</h1>
          <p className="text-muted-foreground">Issue, manage, and track professional certificates</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Issue Certificate
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

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Certificates</CardTitle>
              <CardDescription>Manage issued certificates and their verification status</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search certificates..."
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
                <TableHead>Recipient</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={certificate.recipient.avatar} alt={certificate.recipient.name} />
                        <AvatarFallback>
                          {certificate.recipient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{certificate.recipient.name}</div>
                        <div className="text-sm text-muted-foreground">{certificate.recipient.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{certificate.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {certificate.verificationCode}
                      </div>
                      {certificate.credits && (
                        <div className="text-sm text-blue-600">{certificate.credits} credits</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(certificate.type)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(certificate.issuedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {certificate.expiryDate ? (
                      <div className="text-sm">
                        {new Date(certificate.expiryDate).toLocaleDateString()}
                        {isExpiring(certificate.expiryDate) && (
                          <div className="text-xs text-yellow-600 font-medium">Expiring soon</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(certificate.status)}
                      {getStatusBadge(certificate.status)}
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
                          View certificate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" />
                          Edit details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {certificate.status === "active" && (
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Revoke certificate
                          </DropdownMenuItem>
                        )}
                        {certificate.status === "pending" && (
                          <DropdownMenuItem className="gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Approve certificate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Certificate Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Templates</CardTitle>
          <CardDescription>Quick actions for common certificate types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Award className="w-5 h-5" />
              <span className="text-sm">Completion Certificate</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Achievement Award</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">CE Credits</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Award className="w-5 h-5" />
              <span className="text-sm">Professional Cert</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
