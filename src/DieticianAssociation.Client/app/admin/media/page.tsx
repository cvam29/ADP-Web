"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import PageLoading from "@/components/page-loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
// Replaced lib/api usage with centralized Zustand media store
import { useMediaStore } from "@/store/useMediaStore";
import useDebounce from "@/hooks/use-debounce";
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  FolderPlus,
  Grid3X3,
  List,
  Image as ImageIcon,
  File,
  Video,
  FileText,
  MoreHorizontal,
  Copy,
  Folder,
  FolderOpen,
  FileCode,
  Archive,
  TreePine,
  FileSpreadsheet,
  FileSliders,
  Music,
  FileImage,
  FileVideo,
  FileAudio,
} from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Local view models (store provides raw list; we derive needed shapes)
interface MediaFileView {
  name: string;
  fileName: string;
  folder?: string;
  url?: string;
  size?: number;
  contentType?: string;
  lastModified?: string;
  createdOn?: string;
}

interface MediaFolderView {
  name: string;
  fileCount: number;
  totalSize: number;
  lastModified?: string;
}

interface CurrentFolderItem {
  type: 'folder' | 'file'
  name: string
  displayName: string
  size?: number
  contentType?: string
  lastModified?: string
  createdOn?: string
  url?: string
}

interface MediaUploadData {
  file: File
  folder: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (contentType: string, fileName?: string) => {
  const ext = fileName ? fileName.split('.').pop()?.toLowerCase() : ''
  
  // Handle specific file extensions first
  if (ext) {
    switch (ext) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      case 'ppt':
      case 'pptx':
        return <FileSliders className="w-4 h-4 text-orange-600" />
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <Archive className="w-4 h-4 text-purple-600" />
      case 'json':
        return <FileCode className="w-4 h-4 text-yellow-600" />
      case 'xml':
      case 'html':
      case 'htm':
        return <FileCode className="w-4 h-4 text-orange-500" />
      case 'css':
        return <FileCode className="w-4 h-4 text-blue-500" />
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-yellow-500" />
      case 'txt':
      case 'rtf':
        return <FileText className="w-4 h-4 text-muted-foreground" />
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return <Music className="w-4 h-4 text-purple-500" />
    }
  }
  
  // Fall back to content type detection
  if (contentType.startsWith('image/')) return <FileImage className="w-4 h-4 text-green-500" />
  if (contentType.startsWith('video/')) return <FileVideo className="w-4 h-4 text-blue-500" />
  if (contentType.startsWith('audio/')) return <FileAudio className="w-4 h-4 text-purple-500" />
  if (contentType === 'application/pdf') return <FileText className="w-4 h-4 text-red-600" />
  if (contentType.includes('word') || contentType.includes('document')) return <FileText className="w-4 h-4 text-blue-600" />
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return <FileSpreadsheet className="w-4 h-4 text-green-600" />
  if (contentType.includes('powerpoint') || contentType.includes('presentation')) return <FileSliders className="w-4 h-4 text-orange-600" />
  if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('7z') || contentType.includes('compressed')) return <Archive className="w-4 h-4 text-purple-600" />
  if (contentType.includes('json') || contentType.includes('xml') || contentType.includes('javascript') || contentType.includes('html') || contentType.includes('css')) return <FileCode className="w-4 h-4 text-yellow-600" />
  if (contentType.includes('text')) return <FileText className="w-4 h-4 text-muted-foreground" />
  
  // Default file icon
  return <File className="w-4 h-4 text-muted-foreground" />
}

const getFileTypeLabel = (contentType: string, fileName?: string) => {
  const ext = fileName ? fileName.split('.').pop()?.toLowerCase() : ''
  
  if (ext) {
    switch (ext) {
      case 'pdf': return 'PDF'
      case 'doc': case 'docx': return 'Word'
      case 'xls': case 'xlsx': return 'Excel'
      case 'ppt': case 'pptx': return 'PowerPoint'
      case 'zip': case 'rar': case '7z': return 'Archive'
      case 'json': return 'JSON'
      case 'xml': return 'XML'
      case 'html': case 'htm': return 'HTML'
      case 'css': return 'CSS'
      case 'js': case 'jsx': return 'JavaScript'
      case 'ts': case 'tsx': return 'TypeScript'
      case 'txt': return 'Text'
      case 'csv': return 'CSV'
      case 'mp3': case 'wav': case 'flac': return 'Audio'
      default: return ext.toUpperCase()
    }
  }
  
  if (contentType.includes('octet-stream')) {
    return 'Binary'
  }
  
  return contentType.split('/')[1]?.toUpperCase() || 'File'
}

const getFolderIcon = (folderName: string) => {
  const name = folderName.toLowerCase()
  
  // Special folder icons based on name
  if (name.includes('image') || name.includes('photo') || name.includes('picture')) {
    return <Folder className="w-12 h-12 text-green-600" />
  }
  if (name.includes('video') || name.includes('movie') || name.includes('film')) {
    return <Folder className="w-12 h-12 text-blue-600" />
  }
  if (name.includes('document') || name.includes('doc') || name.includes('file')) {
    return <Folder className="w-12 h-12 text-orange-600" />
  }
  if (name.includes('music') || name.includes('audio') || name.includes('sound')) {
    return <Folder className="w-12 h-12 text-purple-600" />
  }
  if (name.includes('archive') || name.includes('backup') || name.includes('zip')) {
    return <Folder className="w-12 h-12 text-muted-foreground" />
  }
  if (name.includes('public') || name.includes('shared')) {
    return <FolderOpen className="w-12 h-12 text-blue-500" />
  }
  
  // Default folder icon
  return <Folder className="w-12 h-12 text-blue-600" />
}

const isImageFile = (contentType: string): boolean => {
  return contentType.startsWith('image/')
}

const getPreviewUrl = (item: CurrentFolderItem, getDownloadUrl: (fileName: string) => string): string => {
  return item.url || getDownloadUrl(item.name)
}

export default function MediaPage() {
  const { toast } = useToast()
  const {
    media,
    folders,
    folderTree,
    fetchMedia,
    uploadMedia,
    deleteFile,
    fetchFolders,
    fetchFolderTree,
    createFolder,
    deleteFolder,
    getFileUrl,
    getDownloadUrl,
    downloading,
    uploading,
    loading,
    totalItems,
  } = useMediaStore()
  const [mediaFiles, setMediaFiles] = useState<MediaFileView[]>([])
  // Remove local loading/uploading states in favor of store's
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 250)
  const [currentFolder, setCurrentFolder] = useState<string>("")
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'folders'>('grid')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadFolder, setUploadFolder] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMediaFiles = useCallback(async () => {
    try {
      const items = await fetchMedia({ page, pageSize: 20, folder: currentFolder || undefined })
      const mapped: MediaFileView[] = items.map((f: any) => ({
        name: f.name || f.fileName || f.path || "",
        fileName: f.fileName || f.originalName || f.name || "",
        folder: f.folder,
        url: f.url,
        size: f.size,
        contentType: f.contentType,
        lastModified: f.lastModified || f.updatedAt,
        createdOn: f.createdOn || f.createdAt,
      }))
      setMediaFiles(mapped)
      const total = (useMediaStore.getState().totalItems) ?? mapped.length
      setTotalPages(Math.max(1, Math.ceil(total / 20)))
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch media files", variant: "error" })
    }
  }, [fetchMedia, page, currentFolder, toast])

  const navigateToFolder = useCallback((folderPath: string) => {
    setCurrentFolder(folderPath)
    setPage(1)
    
    // Update breadcrumbs
    if (!folderPath) {
      setBreadcrumbs([])
    } else {
      setBreadcrumbs(folderPath.split('/'))
    }
  }, [])

  const navigateUp = useCallback(() => {
    if (breadcrumbs.length > 0) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1)
      const newPath = newBreadcrumbs.join('/')
      navigateToFolder(newPath)
    }
  }, [breadcrumbs, navigateToFolder])

  const navigateToBreadcrumb = useCallback((index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1)
    const newPath = newBreadcrumbs.join('/')
    navigateToFolder(newPath)
  }, [breadcrumbs, navigateToFolder])

  // Store already has fetchFolders & fetchFolderTree

  useEffect(() => {
    fetchMediaFiles()
    fetchFolders()
    fetchFolderTree()
  }, [fetchMediaFiles, fetchFolders, fetchFolderTree])

  const currentFolderItems = useMemo(() => {
    const items: CurrentFolderItem[] = []
    const foundFolders = new Set<string>()

    mediaFiles.forEach((file: MediaFileView) => {
      const relativePath = currentFolder
        ? file.name.substring(currentFolder.length + 1)
        : file.name
      const pathParts = relativePath.split('/')

      if (pathParts.length === 1) {
        items.push({
          type: 'file',
          name: file.name,
          displayName: file.fileName,
          size: file.size,
          contentType: file.contentType,
          lastModified: file.lastModified,
          createdOn: file.createdOn,
          url: file.url,
        })
      } else if (pathParts.length > 1 && pathParts[0]) {
        const folderName = pathParts[0]
        if (!foundFolders.has(folderName)) {
          foundFolders.add(folderName)
          const fullFolderPath = currentFolder
            ? `${currentFolder}/${folderName}`
            : folderName
          items.push({
            type: 'folder',
            name: fullFolderPath,
            displayName: folderName,
          })
        }
      }
    })

    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.displayName.localeCompare(b.displayName)
    })

    return items
  }, [mediaFiles, currentFolder])

  // Recompute filtered items only when dependencies change
  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return currentFolderItems
    const lower = debouncedSearch.toLowerCase()
    return currentFolderItems.filter(item => item.displayName.toLowerCase().includes(lower))
  }, [currentFolderItems, debouncedSearch])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "error"
      })
      return
    }

    try {
      await uploadMedia(selectedFile, uploadFolder || undefined)
      
      toast({
        title: "Success",
        description: "File uploaded successfully"
      })
      setUploadDialogOpen(false)
      setSelectedFile(null)
      setUploadFolder("")
      fetchMediaFiles()
      fetchFolders()
      fetchFolderTree()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "error"
      })
    }
  }, [selectedFile, uploadFolder, uploadMedia, toast, fetchMediaFiles, fetchFolders, fetchFolderTree])

  const handleCreateFolder = useCallback( async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "error"
      })
      return
    }

    try {
  await createFolder(newFolderName.trim())
      toast({
        title: "Success",
        description: "Folder created successfully"
      })
      setNewFolderDialogOpen(false)
      setNewFolderName("")
      fetchFolders()
      fetchFolderTree()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "error"
      })
    }
  }, [newFolderName, createFolder, toast, fetchFolders, fetchFolderTree])

  const handleDeleteFolder = useCallback(async (folderName: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${folderName}" and all its contents?`)) return

    try {
  await deleteFolder(folderName)
      toast({
        title: "Success",
        description: "Folder deleted successfully"
      })
      await fetchFolders()
      await fetchFolderTree()
      await fetchMediaFiles()
      if (currentFolder === folderName) {
        navigateToFolder("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "error"
      })
    }
  }, [deleteFolder, toast, fetchFolders, fetchFolderTree, fetchMediaFiles, currentFolderItems, currentFolder, navigateToFolder])

  const handleCopyUrl = useCallback(async (fileName: string, type: 'direct' | 'download' = 'direct') => {
    try {
      const directUrl = await getFileUrl(fileName)
      const downloadUrl = getDownloadUrl(fileName)
      const urlToCopy = type === 'direct' ? directUrl : downloadUrl
      if (!urlToCopy) {
        throw new Error('URL unavailable')
      }
      await navigator.clipboard.writeText(urlToCopy)
      toast({
        title: "Success",
        description: `${type === 'direct' ? 'Direct' : 'Download'} URL copied to clipboard`
      })
    } catch (error) {
      let errorMessage = "Failed to copy URL"
      if (error instanceof Error && error.message.includes('File not found')) {
        errorMessage = "File not found. The file may have been moved or deleted."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "error"
      })
    }
  }, [getFileUrl, getDownloadUrl, toast])

  const handleDelete = useCallback(async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
  await deleteFile(fileName)
      toast({
        title: "Success",
        description: "File deleted successfully"
      })
      await fetchMediaFiles()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "error"
      })
    }
  }, [deleteFile, toast, fetchMediaFiles])

  const handleDownload = useCallback(async (fileName: string, originalFileName: string) => {
    try {
      // Attempt to fetch binary via store downloadFile (if implemented) or fallback direct fetch
      let blob: Blob | undefined
      try {
        // Prefer the API download endpoint directly
        const resp = await fetch(getDownloadUrl(fileName), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        })
        if (!resp.ok) throw new Error('Download failed')
        blob = await resp.blob()
      } catch (e) {
        throw e
      }
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = originalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "error"
      })
    }
  }, [getDownloadUrl, toast])

  return (
    <div className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your media files and folders</p>
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <button 
              onClick={() => navigateToFolder("")}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <span className="mx-2">/</span>
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {crumb}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for the new folder
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g., blog-images"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder}>
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media File</DialogTitle>
                <DialogDescription>
                  Upload images, videos, documents and other media files
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder">Folder (Optional)</Label>
                  <Input
                    id="folder"
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    placeholder="e.g., blog-images, documents"
                  />
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.zip,.rar,.7z,.json,.xml,.html,.css,.js"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {breadcrumbs.length > 0 && (
              <Button variant="outline" onClick={navigateUp} className="self-start">
                ← Back
              </Button>
            )}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'folders' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('folders')}
                  className="rounded-l-none"
                >
                  <TreePine className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
  {loading ? (
        <PageLoading minHeightClassName="h-64" />
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No media files found</h3>
              <p className="text-muted-foreground mb-4">Get started by uploading your first media file.</p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.name} className="overflow-hidden">
              {item.type === 'folder' ? (
                <div 
                  className="aspect-video bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => navigateToFolder(item.name)}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {getFolderIcon(item.displayName)}
                    <span className="text-sm text-muted-foreground mt-2">Folder</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {item.contentType && isImageFile(item.contentType) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getPreviewUrl(item, getDownloadUrl)}
                      alt={item.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      {item.contentType && getFileIcon(item.contentType, item.displayName)}
                      <span className="text-xs text-muted-foreground mt-2">
                        {item.contentType && getFileTypeLabel(item.contentType, item.displayName)}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm truncate flex-1" title={item.displayName}>
                    {item.displayName}
                  </h3>
                  {item.type === 'file' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(getPreviewUrl(item, getDownloadUrl), '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyUrl(item.name, 'direct')}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Direct URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyUrl(item.name, 'download')}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Download URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(item.name, item.displayName)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="space-y-1">
                  {item.type === 'file' && item.size && (
                    <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                  )}
                  {item.type === 'folder' && (
                    <p className="text-xs text-muted-foreground">Folder</p>
                  )}
                  {item.createdOn && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdOn).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Modified</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.name} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {item.type === 'folder' ? (
                            <div 
                              className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center cursor-pointer"
                              onClick={() => navigateToFolder(item.name)}
                            >
                              <Folder className="w-4 h-4 text-blue-600" />
                            </div>
                          ) : item.contentType && isImageFile(item.contentType) ? (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={getPreviewUrl(item, getDownloadUrl)} alt={item.displayName} />
                              <AvatarFallback>
                                <ImageIcon className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                              {item.contentType && getFileIcon(item.contentType, item.displayName)}
                            </div>
                          )}
                          <span 
                            className={`font-medium ${item.type === 'folder' ? 'cursor-pointer hover:text-blue-600' : ''}`}
                            onClick={item.type === 'folder' ? () => navigateToFolder(item.name) : undefined}
                          >
                            {item.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.type === 'folder' ? (
                          <Badge variant="secondary">Folder</Badge>
                        ) : (
                          <Badge variant="outline">
                            {item.contentType && getFileTypeLabel(item.contentType, item.displayName)}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.type === 'file' && item.size ? formatFileSize(item.size) : '—'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.lastModified ? new Date(item.lastModified).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {item.type === 'file' ? (
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getPreviewUrl(item, getDownloadUrl), '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCopyUrl(item.name, 'direct')}>
                                  Copy Direct URL
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyUrl(item.name, 'download')}>
                                  Copy Download URL
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(item.name, item.displayName)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToFolder(item.name)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folder View */}
  {viewMode === 'folders' && !loading && Array.isArray(folderTree) && folderTree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {folderTree.map((folder) => (
            <Card key={folder.name} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {folder.name === "root" ? <Folder className="w-6 h-6 text-blue-600" /> : <FolderOpen className="w-6 h-6 text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{folder.name === "root" ? "Root Folder" : folder.name}</h3>
                      <p className="text-sm text-muted-foreground">{folder.fileCount} files</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        navigateToFolder(folder.name === "root" ? "" : folder.name)
                        setViewMode('grid')
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Files
                      </DropdownMenuItem>
                      {folder.name !== "root" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteFolder(folder.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Folder
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Size:</span>
                    <span className="font-medium">{formatFileSize(folder.totalSize)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: folderTree.length > 0 ? 
                          `${Math.min((folder.totalSize / Math.max(...folderTree.map(f => f.totalSize))) * 100, 100)}%` : 
                          '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => {
                    navigateToFolder(folder.name === "root" ? "" : folder.name)
                    setViewMode('grid')
                  }}
                >
                  Browse {folder.fileCount} Files
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State for Folder View */}
  {viewMode === 'folders' && Array.isArray(folderTree) && folderTree.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No folders found</h3>
              <p className="text-muted-foreground mb-4">Create your first folder to organize your media files.</p>
              <Button onClick={() => setNewFolderDialogOpen(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
