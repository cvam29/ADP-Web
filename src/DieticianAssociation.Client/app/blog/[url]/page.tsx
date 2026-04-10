import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BlogContent } from "./BlogContent";
import BlogDetailClient from "./BlogDetailClient";
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

const EXPORT_API_BASE =
  process.env.NEXT_PUBLIC_EXPORT_API_URL || "https://api-adp.azure-api.net/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adp.org.in";

function toAbsoluteUrl(value?: string | null) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return undefined;
  }
}

/* ✅ REQUIRED for static export */
export const dynamic = "force-static";

/* ✅ Build-time route generation */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${EXPORT_API_BASE}/blog/slugs`, {
      cache: "force-cache",
    });

    if (!res.ok) {
      console.error("Failed to fetch blog slugs:", res.status);
      return [];
    }

    const json = await res.json();

    let slugs: any[] = [];

    if (Array.isArray(json)) {
      slugs = json;
    } else if (Array.isArray(json?.data)) {
      slugs = json.data;
    } else if (Array.isArray(json?.items)) {
      slugs = json.items;
    } else {
      console.error("Blog slugs API returned unexpected shape");
      return [];
    }

    return slugs
      .filter((s) => typeof s?.url === "string" && s.url.length > 0)
      .map((s) => ({ url: s.url }));
  } catch (err) {
    console.error("generateStaticParams failed:", err);
    return [];
  }
}

/* ✅ Build-time data fetch */
async function getBlog(url: string): Promise<BlogPostDto | null> {
  try {
    const res = await fetch(`${EXPORT_API_BASE}/blog/by-url/${encodeURIComponent(url)}`, {
      cache: "force-cache",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return (json?.data ?? json) as BlogPostDto;
  } catch {
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  const blog = await getBlog(url);

  // Render client component with initial data (for pre-rendered pages)
  // or without (for non-pre-rendered pages accessed via SWA fallback)
  return <BlogDetailClient initialData={blog} />;
}
