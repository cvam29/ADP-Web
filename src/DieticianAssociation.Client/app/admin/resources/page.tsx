"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import PageLoading from "@/components/page-loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  Filter,
  BookOpen,
  Video,
  Image,
  Link,
  Award,
  Calendar,
  Users,
  BarChart3,
  ExternalLink,
  FileImage,
  FileVideo,
  File,
} from "lucide-react";
import { ADPSpinner } from "@/components/ui/adp-spinner";
// Using centralized resources store instead of direct services/types
import { useResourcesStore } from "@/store/useResourcesStore";
import type { ResourceDto, CreateResourceDto } from "@/services/generated";
import { useToast } from "@/hooks/use-toast";
import { useMediaStore } from "@/store/useMediaStore";
import { truncateUrl } from "@/lib/utils";

export default function ResourcesManagement() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Store state
  const {
    resources,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    download,
    loading: resourcesLoading,
  } = useResourcesStore();

  const {
    uploadMedia,
    currentFileInfo = null,
    loading: mediaLoading,
  } = useMediaStore();

  const [filteredResources, setFilteredResources] = useState<ResourceDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false); // local loader for transitional UI (legacy)
  const [stats, setStats] = useState({
    totalResources: 0,
    totalDownloads: 0,
    premiumResources: 0,
    categories: 0,
  });

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [premiumFilter, setPremiumFilter] = useState<string>("all");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceDto | null>(
    null,
  );

  // Form states
  const [createForm, setCreateForm] = useState<CreateResourceDto>({
    title: "",
    description: "",
    category: "",
    type: "",
    format: "",
    premium: false,
    downloadUrl: "", // Required for blob storage URL
    fileSize: "",
  });

  const [editForm, setEditForm] = useState<Partial<CreateResourceDto>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Predefined options
  const categories = [
    "Nutrition Guidelines",
    "Clinical Resources",
    "Educational Materials",
    "Research Papers",
    "Patient Resources",
    "Professional Development",
    "Tools & Calculators",
    "Continuing Education",
  ];

  const resourceTypes = [
    "Document",
    "Video",
    "Audio",
    "Interactive Tool",
    "Template",
    "Presentation",
    "Infographic",
    "Webinar",
  ];

  const formats = [
    "PDF",
    "MP4",
    "MP3",
    "PPTX",
    "DOCX",
    "XLSX",
    "ZIP",
    "HTML",
    "PNG",
    "JPG",
  ];

  // Guard handled globally by useAdminGuard; we just wait until resolved.

  useEffect(() => {
    if (!currentFileInfo) return;

    setCreateForm((prev) => ({
      ...prev,
      downloadUrl: currentFileInfo.url,
      fileSize:
        prev.fileSize ||
        (currentFileInfo.size
          ? `${(currentFileInfo.size / (1024 * 1024)).toFixed(2)} MB`
          : ""),
    }));
  }, [currentFileInfo]);

  // Load resources
  useEffect(() => {
    // initial fetch via store (paged fetch without params -> defaults)
    const init = async () => {
      try {
        await fetchResources();
      } catch (e) {
        // fallback handled by store toast
      }
    };
    init();
  }, [fetchResources]);

  // Filter resources
  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((resource) => {
        const title = (resource.title ?? "").toLowerCase();
        const desc = (resource.description ?? "").toLowerCase();
        const cat = (resource.category ?? "").toLowerCase();
        return (
          title.includes(term) || desc.includes(term) || cat.includes(term)
        );
      });
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (resource) => resource.category === categoryFilter,
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((resource) => resource.type === typeFilter);
    }

    if (formatFilter !== "all") {
      filtered = filtered.filter(
        (resource) => resource.format === formatFilter,
      );
    }

    if (premiumFilter !== "all") {
      filtered = filtered.filter((resource) =>
        premiumFilter === "premium" ? resource.premium : !resource.premium,
      );
    }

    setFilteredResources(filtered);
  }, [
    resources,
    searchTerm,
    categoryFilter,
    typeFilter,
    formatFilter,
    premiumFilter,
  ]);

  // Recompute stats when resources change
  useEffect(() => {
    if (!resources) return;
    setFilteredResources(resources);
    const totalDownloads = resources.reduce(
      (sum, r) => sum + (r.downloads ?? 0),
      0,
    );
    const premiumCount = resources.filter((r) => !!r.premium).length;
    const uniqueCategories = new Set(
      resources.map((r) => r.category).filter(Boolean),
    ).size;
    setStats({
      totalResources: resources.length,
      totalDownloads,
      premiumResources: premiumCount,
      categories: uniqueCategories,
    });
  }, [resources]);

  const handleCreateResource = async () => {
    // Validate that we have a blob storage URL
    if (!createForm.downloadUrl) {
      toast({
        title: "Error",
        description: "Please upload a file first to get the blob storage URL",
        variant: "error",
      });
      return;
    }

    try {
      await createResource(createForm);
      toast({
        title: "Success",
        description: "Resource created successfully",
      });

      setShowCreateDialog(false);
      resetCreateForm();
    } catch (error) {
      console.error("Error creating resource:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create resource",
        variant: "error",
      });
    }
  };

  const handleUpdateResource = async () => {
    if (!selectedResource) return;

    try {
      if (!selectedResource.id) return;
      await updateResource(selectedResource.id, editForm as CreateResourceDto);
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });

      setShowEditDialog(false);
      setSelectedResource(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating resource:", error);
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "error",
      });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteResource(resourceId);
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "error",
      });
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      description: "",
      category: "",
      type: "",
      format: "",
      premium: false,
      downloadUrl: "",
      fileSize: "",
    });
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill format based on file extension
      const extension = file.name.split(".").pop()?.toUpperCase();
      if (extension && formats.includes(extension)) {
        setCreateForm((prev) => ({ ...prev, format: extension }));
      }
      // Auto-fill file size
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setCreateForm((prev) => ({ ...prev, fileSize: `${sizeMB} MB` }));
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !createForm.category) {
      toast({
        title: "Error",
        description: "Please select a file and category before uploading",
        variant: "error",
      });
      return;
    }

    try {
      setIsUploading(true);
      // NOTE: No direct upload endpoint in store yet. Placeholder for integration.
      // If upload logic is needed, implement in store and call here.
      const uploadFolder = "resources/" + createForm.category;

      await uploadMedia(selectedFile, uploadFolder || undefined);

      toast({ title: "Info", description: "File Upload Successfuly." });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload file",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadResource = async (resource: ResourceDto) => {
    if (!resource.downloadUrl) {
      toast({
        title: "Error",
        description: "No file available for download",
        variant: "error",
      });
      return;
    }

    try {
      if (
        resource.downloadUrl &&
        resource.downloadUrl.includes("blob.core.windows.net")
      ) {
        const link = document.createElement("a");
        link.href = resource.downloadUrl;
        link.download = resource.title ?? "resource";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        if (!resource.id) return;
        const blob = await download(resource.id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = resource.title ?? "resource";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
      toast({ title: "Success", description: "Download started" });
    } catch (error) {
      console.error("Error downloading resource:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to download file",
        variant: "error",
      });
    }
  };

  const getResourceIcon = (type: string, format: string) => {
    switch (type.toLowerCase()) {
      case "document":
        if (format.toLowerCase() === "pdf")
          return <FileText className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
      case "video":
        return <FileVideo className="w-4 h-4" />;
      case "audio":
        return <FileImage className="w-4 h-4" />;
      case "interactive tool":
        return <Link className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      Document: "bg-blue-100 text-blue-800",
      Video: "bg-purple-100 text-purple-800",
      Audio: "bg-green-100 text-green-800",
      "Interactive Tool": "bg-orange-100 text-orange-800",
      Template: "bg-gray-100 text-gray-800",
      Presentation: "bg-red-100 text-red-800",
      Infographic: "bg-pink-100 text-pink-800",
      Webinar: "bg-indigo-100 text-indigo-800",
    };
    return (
      <Badge className={typeMap[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const getPremiumBadge = (premium: boolean) => {
    return premium ? (
      <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
    ) : (
      <Badge variant="outline">Free</Badge>
    );
  };

  const openEditDialog = (resource: ResourceDto) => {
    setSelectedResource(resource);
    setEditForm({
      title: resource.title ?? "",
      description: resource.description ?? "",
      category: resource.category ?? "",
      type: resource.type ?? "",
      format: resource.format ?? "",
      premium: !!resource.premium,
      downloadUrl: resource.downloadUrl ?? "",
      fileSize: resource.fileSize ?? "",
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (resource: ResourceDto) => {
    setSelectedResource(resource);
    setShowViewDialog(true);
  };

  if (loading || resourcesLoading) {
    return <PageLoading />;
  }

  if (!user) return null;

  // Stats moved to central Admin Dashboard (app/admin/page.tsx)

  return (
    <div className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Resources Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage educational materials and guides
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Resource</DialogTitle>
                <DialogDescription>
                  Upload educational materials and guides for users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, title: e.target.value })
                    }
                    placeholder="Enter resource title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter resource description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-category">Category</Label>
                    <Select
                      value={createForm.category}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-type">Type</Label>
                    <Select
                      value={createForm.type}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-file">Upload File</Label>
                  <Input
                    id="create-file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.png,.jpg,.jpeg,.zip"
                  />
                  <p className="text-xs text-muted-foreground">
                    Files will be stored in Azure Blob Storage under the
                    resources/{"{category}"} folder
                  </p>
                  {selectedFile && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} (
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                      <Button
                        type="button"
                        onClick={handleUploadFile}
                        disabled={isUploading || !createForm.category}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload to Blob Storage
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {createForm.downloadUrl && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ File uploaded successfully
                      </p>
                      <p className="text-xs text-green-600 truncate">
                        <a
                          href={createForm.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 truncate block hover:underline"
                        >
                          {truncateUrl(createForm.downloadUrl)}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-format">Format</Label>
                    <Select
                      value={createForm.format}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, format: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-premium">Access Level</Label>
                    <Select
                      value={(createForm.premium ?? false).toString()}
                      onValueChange={(value) =>
                        setCreateForm({
                          ...createForm,
                          premium: value === "true",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Free Access</SelectItem>
                        <SelectItem value="true">Premium Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-download-url">Blob Storage URL</Label>
                  <Input
                    id="create-download-url"
                    value={createForm.downloadUrl}
                    readOnly
                    placeholder="Upload a file to generate blob storage URL"
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    This URL is automatically generated when you upload a file
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateResource}
                  disabled={isLoading || isUploading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Resource
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats moved to central Admin Dashboard */}

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {resourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                {formats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={premiumFilter} onValueChange={setPremiumFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Resources</CardTitle>
              <CardDescription>
                {resourcesLoading
                  ? "Loading resources..."
                  : `Showing ${filteredResources.length} of ${resources.length} resources`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <ADPSpinner size="sm" />
            </div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getResourceIcon(
                              resource.type ?? "",
                              resource.format ?? "",
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {resource.format} • {resource.fileSize}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.category}</Badge>
                      </TableCell>
                      <TableCell>{getTypeBadge(resource.type ?? "")}</TableCell>
                      <TableCell>
                        {getPremiumBadge(!!resource.premium)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4 text-muted-foreground" />
                          {resource.downloads}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {resource.date
                          ? new Date(resource.date).toLocaleDateString()
                          : ""}
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
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => openViewDialog(resource)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => openEditDialog(resource)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Resource
                            </DropdownMenuItem>
                            {resource.downloadUrl && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleDownloadResource(resource)}
                              >
                                <Download className="w-4 h-4" />
                                Download File
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="gap-2 text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Resource
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the resource &ldquo;
                                    {resource.title}&rdquo;.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      resource.id &&
                                      handleDeleteResource(resource.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Resource Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update resource information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-premium">Access Level</Label>
                <Select
                  value={editForm.premium?.toString()}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, premium: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Free Access</SelectItem>
                    <SelectItem value="true">Premium Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateResource}>Update Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Resource Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resource Details</DialogTitle>
            <DialogDescription>
              Complete information about the resource
            </DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getResourceIcon(
                    selectedResource.type ?? "",
                    selectedResource.format ?? "",
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedResource.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {selectedResource.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{selectedResource.category}</Badge>
                    {getTypeBadge(selectedResource.type ?? "")}
                    {getPremiumBadge(!!selectedResource.premium)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    File Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Format:</span>
                      <span className="text-sm font-medium">
                        {selectedResource.format}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">File Size:</span>
                      <span className="text-sm font-medium">
                        {selectedResource.fileSize}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Downloads:</span>
                      <span className="text-sm font-medium">
                        {selectedResource.downloads}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Publishing Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Access Level:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedResource.premium ? "Premium" : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date Added:</span>
                      <span className="text-sm font-medium">
                        {selectedResource.date
                          ? new Date(selectedResource.date).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Resource ID:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedResource.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedResource.downloadUrl && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() =>
                      selectedResource.downloadUrl &&
                      window.open(selectedResource.downloadUrl, "_blank")
                    }
                    className="w-full gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Resource
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
