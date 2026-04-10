"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBlogStore } from "@/store/useBlogStore";
import useDebounce from "@/hooks/use-debounce";
import FeedbackMessage from "@/components/feedback-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Edit, Plus, Trash2, Check, X as XIcon } from "lucide-react";
import Pagination from "../users/Pagination";
import { getDieticianAssociationAPI } from "@/services/generated";
import { toast } from "@/hooks/use-toast";

export default function AdminBlogsPage() {
  const {
    posts,
    pagedResult,
    categories,
    loading,
    success,
    message,
    fetchPosts,
    fetchCategories,
    deletePost,
    clearMessage,
  } = useBlogStore();

  // Paging & filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(
    undefined,
  );

  const debouncedSearch = useDebounce(search, 500);
  const debouncedCategory = useDebounce(categoryFilter, 500);
  const debouncedPublished = useDebounce(publishedFilter, 500);

  const params = useMemo(() => {
    const filters: Record<string, unknown> = {};
    if (debouncedCategory) filters.category = debouncedCategory;
    if (debouncedPublished !== undefined)
      filters.isPublished = debouncedPublished;

    const p: any = {
      page,
      pageSize,
    };
    if (debouncedSearch) p.search = debouncedSearch;
    if (Object.keys(filters).length > 0) p.filters = filters;
    return p;
  }, [page, pageSize, debouncedSearch, debouncedCategory, debouncedPublished]);

  useEffect(() => {
    fetchPosts(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedCategory, debouncedPublished]);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleApprove = async (postId: string) => {
    try {
      const adminApi = getDieticianAssociationAPI();
      await adminApi.putApiBlogIdApprove(postId);
      toast({ title: "Success", description: "Edit approved and published", variant: "success" });
      fetchPosts(params);
    } catch {
      toast({ title: "Error", description: "Failed to approve edit", variant: "error" });
    }
  };

  const handleReject = async (postId: string) => {
    try {
      const adminApi = getDieticianAssociationAPI();
      await adminApi.putApiBlogIdReject(postId);
      toast({ title: "Success", description: "Edit rejected", variant: "success" });
      fetchPosts(params);
    } catch {
      toast({ title: "Error", description: "Failed to reject edit", variant: "error" });
    }
  };

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <FeedbackMessage
        message={message ?? undefined}
        success={success}
        onClear={clearMessage}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Blogs
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and organize your platform’s blog posts.
          </p>
        </div>
        <Link href="/admin/blogs/add-edit">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Blog
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter through blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            <Select
              value={categoryFilter}
              onValueChange={(val) => setCategoryFilter(val)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.length ? (
                  categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-gray-500">
                    No categories
                  </div>
                )}
              </SelectContent>
            </Select>

            <Select
              value={
                debouncedPublished === undefined
                  ? undefined
                  : String(debouncedPublished)
              }
              onValueChange={(val) => setPublishedFilter(val === "true")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
              </SelectContent>
            </Select>

            {(search || categoryFilter || publishedFilter !== undefined) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter(undefined);
                  setPublishedFilter(undefined);
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>List of all blog posts with details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && posts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No posts found
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  posts?.map((post) => (
                    <TableRow key={post.id ?? Math.random().toString()}>
                      <TableCell className="font-medium">
                        {post.title}
                        {post.featured && (
                          <Badge className="ml-2" variant="secondary">
                            Featured
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{post.category ?? "—"}</TableCell>
                      <TableCell>{post.author?.name ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {post.isPublished ? (
                            <Badge
                              className="bg-green-100 text-green-800 border-green-200 w-fit"
                              variant="outline"
                            >
                              Published
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200 w-fit" variant="outline">Draft</Badge>
                          )}
                          {(post.hasPendingEdit || post.editStatus === "PendingReview") && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 w-fit" variant="outline">
                              Pending Edit
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString()
                            : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(post.hasPendingEdit || post.editStatus === "PendingReview") && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(String(post.id))}
                                title="Approve edit"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(String(post.id))}
                                title="Reject edit"
                              >
                                <XIcon className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Link href={`/admin/blogs/add-edit?id=${post.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(String(post.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagedResult && (
            <div className="mt-6">
              <Pagination
                page={page}
                pageSize={pageSize}
                pagedResult={pagedResult}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return;
                await deletePost(deleteId);
                const result = await fetchPosts(params);
                const hasItems = (result.items ?? []).length > 0;
                if (!hasItems && page > 1) {
                  const prevPageParams = { ...params, page: page - 1 } as any;
                  setPage((p) => Math.max(1, p - 1));
                  await fetchPosts(prevPageParams);
                }
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
