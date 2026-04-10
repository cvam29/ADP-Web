"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBlogStore } from "@/store/useBlogStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Search,
  Calendar,
  Edit,
  Eye,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import type { BlogPostDto } from "@/services/generated";
import PageLoading from "@/components/page-loading";

function getEditStatusBadge(status?: string, hasPendingEdit?: boolean) {
  if (hasPendingEdit || status === "PendingReview") {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pending Review
      </Badge>
    );
  }
  if (status === "Draft") {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
        Draft
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      Published
    </Badge>
  );
}

export default function MyArticlesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { myPosts, myPostsPagedResult, fetchMyPosts, loading } = useBlogStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPosts = useCallback(() => {
    fetchMyPosts({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: "UpdatedAt",
      sortDirection: "desc",
    });
  }, [fetchMyPosts, page, pageSize, debouncedSearch]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please log in to view your articles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Articles</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your articles. Submit edits for admin approval.
          </p>
        </div>
        <Link href="/dashboard/articles/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Article
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your articles..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {loading && myPosts.length === 0 && (
        <PageLoading message="Loading your articles..." />
      )}

      {/* Empty State */}
      {!loading && myPosts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
            <p className="text-muted-foreground max-w-md">
              You haven&apos;t created any articles yet. Click &quot;New Article&quot; to write
              your first article and submit it for admin review.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Articles List */}
      <div className="space-y-4">
        {myPosts.map((post: BlogPostDto) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold truncate">{post.title}</h3>
                    {getEditStatusBadge(post.editStatus ?? undefined, post.hasPendingEdit)}
                    {post.version && post.version > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        v{post.version}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {post.date
                          ? new Date(post.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                    {post.category && (
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {post.isPublished && post.url && (
                    <Link href={`/blog/${post.url}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/articles/edit?id=${post.id}`)
                    }
                    disabled={post.editStatus === "PendingReview" || post.hasPendingEdit}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {myPostsPagedResult && (myPostsPagedResult.totalPages ?? 0) > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={myPostsPagedResult.totalPages ?? 1}
          pageSize={pageSize}
          totalItems={myPostsPagedResult.totalItems ?? 0}
          hasNextPage={myPostsPagedResult.hasNext ?? false}
          hasPreviousPage={myPostsPagedResult.hasPrevious ?? false}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      )}
    </div>
  );
}
