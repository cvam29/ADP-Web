"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BlogContent } from "./BlogContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  Bookmark,
} from "lucide-react";
import type { BlogPostDto } from "@/services/generated";
import PageLoading from "@/components/page-loading";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_EXPORT_API_URL ||
  "https://api-adp.azure-api.net/api";

interface BlogDetailClientProps {
  initialData?: BlogPostDto | null;
}

export default function BlogDetailClient({ initialData }: BlogDetailClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const url = pathname?.split("/blog/")[1]?.replace(/\/$/, "") ?? "";

  const [blog, setBlog] = useState<BlogPostDto | null | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialData) return;
    if (!url) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/blog/by-url/${encodeURIComponent(url)}`
        );
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const json = await res.json();
        const post = (json?.data ?? json) as BlogPostDto;
        setBlog(post);

        // If the post was found by PreviousUrl, redirect to the current URL
        if (post && post.url && post.url !== url) {
          router.replace(`/blog/${post.url}`);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [url, initialData, router]);

  if (loading) {
    return (
      <PageLoading
        className="container mx-auto px-4 py-8"
        contentClassName="text-center"
        direction="column"
        message="Loading blog post..."
        textClassName="text-muted-foreground"
      />
    );
  }

  if (notFound || !blog) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The blog post you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href="/blog">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const publishedAt = blog.publishedAt ?? blog.date;
  const updatedAt = blog.updatedAt ?? publishedAt;

  return (
    <article className="mx-auto max-w-3xl py-12">
      {/* Back */}
      <Link href="/blog">
        <Button
          variant="ghost"
          className="mb-8 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </Link>

      {blog.featured && (
        <Badge variant="secondary" className="mb-4">
          Featured Post
        </Badge>
      )}

      <h1 className="text-4xl font-bold tracking-tight mb-4">{blog.title}</h1>

      <p className="text-xl text-muted-foreground mb-6">{blog.excerpt}</p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={blog.author?.name ?? ""} />
            <AvatarFallback>
              {blog.author?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") ?? "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {blog.author?.name ?? "Author"}
            </p>
            <p className="text-xs">
              {blog.author?.designation ?? "Contributor"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {publishedAt
              ? new Date(publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{blog.readTime ?? "5 min"}</span>
        </div>

        <Badge variant="outline">{blog.category ?? "General"}</Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
        <Button variant="outline" size="sm">
          <Bookmark className="h-4 w-4 mr-2" /> Save
        </Button>
      </div>

      {/* Image */}
      {blog.image && (
        <Image
          src={blog.image}
          alt={blog?.title ?? ""}
          width={1200}
          height={630}
          unoptimized
          className="w-full rounded-lg shadow mb-8"
        />
      )}

      <Separator className="mb-8" />

      {/* Content */}
      <BlogContent content={blog.content ?? ""} />

      {/* Tags */}
      {blog?.tags && blog.tags.length > 0 && (
        <div className="mt-8 flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {blog.tags.map((tag: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Author */}
      <div className="mt-12 flex items-center gap-4 border-t pt-8">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">
            {blog.author?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") ?? "A"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{blog.author?.name}</p>
          <p className="text-sm text-muted-foreground">
            {blog.author?.designation}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 flex justify-between items-center border-t pt-8">
        <div>
          <p className="text-sm text-muted-foreground">
            Published on{" "}
            {publishedAt
              ? new Date(publishedAt).toLocaleDateString()
              : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {updatedAt ? new Date(updatedAt).toLocaleDateString() : ""}
          </p>
        </div>
        <Link href="/blog">
          <Button variant="outline">View All Posts</Button>
        </Link>
      </div>
    </article>
  );
}
