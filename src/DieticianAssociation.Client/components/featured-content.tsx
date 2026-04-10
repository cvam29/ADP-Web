"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, ArrowRight } from "lucide-react"
import { ADPSpinner } from "@/components/ui/adp-spinner"
import Link from "next/link"
import Image from "next/image"
import { getBlogPostUrl } from "@/lib/blog-utils"
import { useEffect } from "react"
import { useBlogStore } from "@/store/useBlogStore"
import type { BlogPostDto } from "@/services/generated"

export function FeaturedContent() {
  const { featured: featuredPosts, fetchFeatured, loading, error } = useBlogStore()

  useEffect(() => {
    fetchFeatured(3)
  }, [fetchFeatured])

  if (loading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest Insights</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay updated with the latest research, best practices, and industry developments.
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-3">
              <ADPSpinner size="md" />
              <p className="text-slate-600">Loading featured articles...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest Insights</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay updated with the latest research, best practices, and industry developments.
            </p>
          </div>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchFeatured(3)}>Try Again</Button>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest Insights</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Stay updated with the latest research, best practices, and industry developments.
          </p>
        </div>
        {(!featuredPosts || featuredPosts.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No featured articles yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post: BlogPostDto) => (
            <Card key={post.id ?? Math.random().toString(36)} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden group relative">
              <div className="relative overflow-hidden flex-none">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title ?? "Blog image"}
                  width={300}
                  height={200}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  className="w-full h-36 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-white/95 text-emerald-800 hover:bg-white shadow-sm border-0">
                  {post.category || 'General'}
                </Badge>
              </div>
              <CardHeader className="flex-none pb-4">
                <CardTitle className="text-xl line-clamp-2 group-hover:text-emerald-700 transition-colors leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="line-clamp-3 text-sm text-slate-600 mb-6">
                  {post.excerpt}
                </CardDescription>
                
                <div className="mt-auto flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-[100px] sm:max-w-[120px]" title={post.author?.name || 'Anonymous'}>{post.author?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{post.readTime || ''}</span>
                    </div>
                  </div>
                  <Link
                    href={getBlogPostUrl({ id: (post.id ?? '') as string, url: post.url ?? undefined, title: post.title ?? undefined })}
                    className="flex justify-center items-center py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors font-medium text-sm group/btn"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/blog">View All Articles</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
