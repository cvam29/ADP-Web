"use client"

import { Button } from "@/components/ui/button"
import { Clock, User, ArrowRight } from "lucide-react"
import { ADPSpinner } from "@/components/ui/adp-spinner"
import Link from "next/link"
import Image from "next/image"
import { getBlogPostUrl } from "@/lib/blog-utils"
import { startTransition, useCallback, useEffect, useRef, useState } from "react"
import type { BlogPostDto } from "@/services/generated"
import { streamBlogPosts } from "@/lib/content-stream"

export function FeaturedContent() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPostDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadFeaturedPosts = useCallback(async () => {
    abortRef.current?.abort()
    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      setLoading(true)
      setError(null)
      setFeaturedPosts([])

      await streamBlogPosts(
        {
          page: 1,
          pageSize: 3,
          sortBy: "PublishedDate",
          sortDirection: "desc",
          featured: true,
        },
        {
          signal: abortController.signal,
          onMeta: () => {
            setLoading(false)
          },
          onItem: (post) => {
            startTransition(() => {
              setFeaturedPosts((prev) => [...prev, post])
              setLoading(false)
            })
          },
        },
      )
    } catch (streamError) {
      if (abortController.signal.aborted) {
        return
      }

      setError(streamError instanceof Error ? streamError.message : "Unable to load featured articles.")
      setLoading(false)
    } finally {
      if (abortRef.current === abortController) {
        abortRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    loadFeaturedPosts()

    return () => {
      abortRef.current?.abort()
    }
  }, [loadFeaturedPosts])

  const sectionHeading = (
    <div className="text-center mb-14">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">Latest Insights</h2>
      <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Stay updated with the latest research, best practices, and industry developments.
      </p>
    </div>
  )

  if (loading) {
    return (
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          {sectionHeading}
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-3">
              <ADPSpinner size="md" />
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading featured articles...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          {sectionHeading}
          <div className="text-center">
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <Button variant="outline" onClick={loadFeaturedPosts} className="rounded-full">Try Again</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        {sectionHeading}
        {(!featuredPosts || featuredPosts.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No featured articles yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post: BlogPostDto, index: number) => (
              <div key={post.id ?? `${post.title}-${index}`} className="group flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-150 animate-in fade-in-0 slide-in-from-bottom-4" style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}>
                <div className="relative overflow-hidden flex-none">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title ?? "Blog image"}
                    width={300}
                    height={200}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="w-full h-44 object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-zinc-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {post.category || 'General'}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed flex-1 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[100px]" title={post.author?.name || 'Anonymous'}>{post.author?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime || ''}</span>
                    </div>
                  </div>
                  <Link
                    href={getBlogPostUrl({ id: (post.id ?? '') as string, url: post.url ?? undefined, title: post.title ?? undefined })}
                    className="mt-4 flex items-center gap-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="rounded-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <Link href="/blog">View All Articles</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
