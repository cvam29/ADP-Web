"use client"

import PageLoading from "@/components/page-loading"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, BookOpen, FileText, Video, Calculator, Lock, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useResourcesStore } from "@/store/useResourcesStore"
import type { ResourceDto } from "@/services/generated"

export default function ResourcesPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Local UI state
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedFormat, setSelectedFormat] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Store state & actions
  const {
    resources,
    categories: storeCategories,
    formats: storeFormats,
    loading,
    fetchResources,
    fetchPublicFreeResources,
    fetchCategories,
    fetchFormats,
    download,
    downloadPublicFree,
  } = useResourcesStore()

  const isAuthenticated = !!user

  // Load resources (initial + on auth change)
  const load = useCallback(async (q?: string) => {
    const params = q?.trim()
      ? { search: q.trim(), page: 1, pageSize: 50 }
      : { page: 1, pageSize: 50 }
    try {
      if (isAuthenticated) {
        await fetchResources(params as any)
      } else {
        await fetchPublicFreeResources(params as any)
      }
      // derive categories & formats from freshly fetched list
      await fetchCategories()
      await fetchFormats()
    } catch (e) {
      // errors already handled by store toast
    }
  }, [isAuthenticated, fetchResources, fetchPublicFreeResources, fetchCategories, fetchFormats])

  useEffect(() => {
    load()
  }, [load])

  // Handle search (Enter key or explicit trigger)
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)])
    }
    await load(query)
  }

  // Filtered resources (client-side for category & format)
  const filteredResources = useMemo(() => {
    return (resources ?? []).filter(r => {
      if (!r) return false
      const categoryOk = selectedCategory === "All" || r.category === selectedCategory
      const formatOk = selectedFormat === "All" || r.format === selectedFormat
      return categoryOk && formatOk
    })
  }, [resources, selectedCategory, selectedFormat])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleClearFilters = () => {
    setSelectedCategory("All")
    setSelectedFormat("All")
    setSearchQuery("")
    load()
  }

  // Download handler using store (auth vs public)
  const handleDownload = async (resource: ResourceDto) => {
    const id = (resource.id ?? undefined) as string | undefined
    if (!id) return
    if (resource.premium && !isAuthenticated) {
      router.push(`/login?redirect=/resources`)
      return
    }
    try {
      const blob = resource.premium ? await download(id) : await downloadPublicFree(id)
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        const ext = (resource.format || '').toLowerCase()
        a.download = `${resource.title || 'resource'}${ext ? '.' + ext : ''}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (_) {
      /* store already toasts */
    }
  }

  // Build categories / formats list for UI (prepend All)
  const categories = useMemo(() => ["All", ...storeCategories], [storeCategories])
  const formats = useMemo(() => ["All", ...storeFormats], [storeFormats])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-secondary/30 py-16 px-4">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Library
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Resource Library</h1>
            <p className="text-base text-muted-foreground mt-2">
              Professional resources, research papers, tools, and educational materials.
              {!user && (
                <span className="text-emerald-600 font-medium">
                  {" "}Free resources available without registration.
                </span>
              )}
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedCategory !== "All" || selectedFormat !== "All" || searchQuery) && (
            <>
              <div className="flex items-center gap-2">
                {selectedCategory !== "All" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => handleCategoryChange("All")}>
                    {selectedCategory} &times;
                  </Badge>
                )}
                {selectedFormat !== "All" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedFormat("All")}>
                    {selectedFormat} &times;
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => handleSearch("")}>
                    &ldquo;{searchQuery}&rdquo; &times;
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear all</Button>
            </>
          )}

          <span className="ml-auto text-sm text-slate-500">
            {loading ? 'Loading...' : `${filteredResources.length} resources`}
          </span>
        </div>
      </div>

      {/* Resources Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <PageLoading
            minHeightClassName="py-12"
            direction="column"
            iconClassName="h-12 w-12 text-emerald-500"
            message="Loading resources..."
            textClassName="text-slate-600"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => {
              const type = (resource.type || '').toLowerCase()
              const getIconAndGradient = (t: string) => {
                switch (t) {
                  case 'pdf':
                  case 'document':
                    return { icon: FileText, gradient: 'from-rose-100 to-orange-50', iconColor: 'text-rose-500' }
                  case 'video':
                    return { icon: Video, gradient: 'from-blue-100 to-indigo-50', iconColor: 'text-blue-500' }
                  case 'calculator':
                  case 'tool':
                    return { icon: Calculator, gradient: 'from-amber-100 to-yellow-50', iconColor: 'text-amber-600' }
                  default:
                    return { icon: BookOpen, gradient: 'from-emerald-100 to-teal-50', iconColor: 'text-emerald-600' }
                }
              }
              const { icon: IconComponent, gradient, iconColor } = getIconAndGradient(type)

              return (
                <Card key={resource.id || Math.random()} className="group overflow-hidden border-border bg-card hover:border-primary/30 transition-colors duration-150 rounded-2xl">
                  {/* Icon header — mimics event card image area */}
                  <div className={`relative h-44 w-full bg-gradient-to-br ${gradient} overflow-hidden flex items-center justify-center`}>
                    <IconComponent className={`w-16 h-16 ${iconColor} opacity-80 group-hover:scale-110 transition-transform duration-300`} />

                    {/* Format badge (top-left, like event date badge) */}
                    {resource.format && (
                      <div className="absolute left-3 top-3 rounded-md overflow-hidden shadow-md">
                        <div className="bg-white/95 text-slate-700 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 text-center">
                          {resource.type || 'File'}
                        </div>
                        <div className="bg-slate-700 text-white text-xs font-bold px-2 py-1 text-center uppercase">
                          {resource.format}
                        </div>
                      </div>
                    )}

                    {/* Premium/Free badge (top-right, like event price badge) */}
                    <div className="absolute right-3 top-3">
                      {resource.premium ? (
                        <div className="px-2 py-1 rounded-md bg-purple-600 text-white text-xs font-medium shadow flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Premium
                        </div>
                      ) : (
                        <div className="px-2 py-1 rounded-md bg-white/90 text-slate-700 text-xs font-medium border">
                          Free
                        </div>
                      )}
                    </div>

                    {/* File size chip (bottom-right) */}
                    {resource.fileSize && (
                      <div className="absolute right-3 bottom-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-medium border">
                          {resource.fileSize}
                        </span>
                      </div>
                    )}

                    {/* Download count chip (bottom-left) */}
                    <div className="absolute left-3 bottom-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-medium border">
                        <Download className="h-3 w-3" /> {resource.downloads ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {resource.title || 'Untitled Resource'}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {resource.date ? new Date(resource.date).toLocaleDateString() : ''}
                      </div>
                      <Button
                        size="sm"
                        className="ml-auto"
                        onClick={() => handleDownload(resource)}
                        variant={resource.premium && !isAuthenticated ? "outline" : "default"}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {resource.premium && !isAuthenticated ? "Login" : "Download"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No resources found</h3>
            <p className="text-slate-600">
              {searchQuery
                ? "Try adjusting your search terms or filters."
                : "Try a different search or check back later."}
            </p>
            {(searchQuery || selectedCategory !== "All" || selectedFormat !== "All") && (
              <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
