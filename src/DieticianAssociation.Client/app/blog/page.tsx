"use client";

import PageLoading from "@/components/page-loading";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Search, Calendar, ArrowRight, Star, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useBlogStore } from "@/store/useBlogStore";
import type {
  BlogPostDto,
  BlogPostDtoPagedResult,
  PagedRequest,
} from "@/services/generated";
import { getBlogPostUrl } from "@/lib/blog-utils";

export default function BlogPage() {
  const { fetchPosts, loading, error } = useBlogStore();

  type UIPagination = {
    items: BlogPostDto[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };

  const [paginationData, setPaginationData] = useState<UIPagination>({
    items: [],
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState("PublishedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categories, setCategories] = useState<string[]>([]);

  /**
   * ------------------------------------------------------
   * Debounce search input
   * ------------------------------------------------------
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * ------------------------------------------------------
   * Fetch blog posts
   * ------------------------------------------------------
   */
  const fetchBlogPosts = useCallback(
    async (params: Partial<PagedRequest & { category?: string }> = {}) => {
      try {
        const effectiveCategory =
          params.category !== undefined
            ? params.category === "all"
              ? undefined
              : params.category
            : selectedCategory === "all"
              ? undefined
              : selectedCategory;

        const requestParams: PagedRequest = {
          page: params.page ?? paginationData.currentPage,
          pageSize: params.pageSize ?? paginationData.pageSize,
          search:
            params.search !== undefined ? params.search : debouncedSearchTerm,
          sortBy: params.sortBy ?? sortBy,
          sortDirection: params.sortDirection ?? sortDirection,
          filters: {
            isPublished: true,
            ...(effectiveCategory ? { category: effectiveCategory } : {}),
          },
        };

        const result: BlogPostDtoPagedResult = await fetchPosts(requestParams);

        setPaginationData({
          items: result.items ?? [],
          currentPage: result.page ?? 1,
          pageSize: result.pageSize ?? requestParams.pageSize ?? 10,
          totalItems: result.totalItems ?? 0,
          totalPages: result.totalPages ?? 0,
          hasPreviousPage: result.hasPrevious ?? false,
          hasNextPage: result.hasNext ?? false,
        });

        const currentCategories = Array.from(
          new Set(
            (result.items ?? []).map((post) => post.category).filter(Boolean),
          ),
        ) as string[];

        setCategories((prev) =>
          Array.from(new Set([...prev, ...currentCategories])),
        );
      } catch (err) {
        console.error("Error fetching blog posts:", err);
      }
    },
    [
      fetchPosts,
      paginationData.currentPage,
      paginationData.pageSize,
      debouncedSearchTerm,
      selectedCategory,
      sortBy,
      sortDirection,
    ],
  );

  /**
   * ------------------------------------------------------
   * Auto fetch (initial load + debounced search + filters)
   * ------------------------------------------------------
   */
  useEffect(() => {
    fetchBlogPosts({ page: 1 });
  }, [fetchBlogPosts]);

  /**
   * ------------------------------------------------------
   * Handlers
   * ------------------------------------------------------
   */
  const handleSearch = () => {
    fetchBlogPosts({
      page: 1,
      search: searchTerm,
      category: selectedCategory,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchBlogPosts({
      page: 1,
      category,
      search: debouncedSearchTerm,
    });
  };

  const handleSortChange = (field: string) => {
    const newDirection =
      field === sortBy && sortDirection === "desc" ? "asc" : "desc";

    setSortBy(field);
    setSortDirection(newDirection);

    fetchBlogPosts({
      page: 1,
      sortBy: field,
      sortDirection: newDirection,
    });
  };

  const handlePageChange = (page: number) => {
    fetchBlogPosts({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchBlogPosts({ page: 1, pageSize });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedCategory("all");
    setSortBy("PublishedDate");
    setSortDirection("desc");

    fetchBlogPosts({
      page: 1,
      search: "",
      category: "all",
      sortBy: "PublishedDate",
      sortDirection: "desc",
    });
  };

  const formatDate = (date?: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  /**
   * ------------------------------------------------------
   * Loading / Error
   * ------------------------------------------------------
   */
  if (loading) {
    return (
      <PageLoading
        minHeightClassName="min-h-screen"
        direction="column"
        iconClassName="h-10 w-10 text-green-600"
        message="Loading blog posts..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  /**
   * ------------------------------------------------------
   * Render
   * ------------------------------------------------------
   */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Blog</h1>
            <p className="text-lg text-slate-600 mt-2">
              Insights, research, and professional perspectives from dietetics experts.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 bg-white/90 backdrop-blur"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortDirection}`}
            onValueChange={(value) => {
              const [field, direction] = value.split("-");
              setSortBy(field);
              setSortDirection(direction as "asc" | "desc");
              handleSortChange(field);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PublishedDate-desc">Newest First</SelectItem>
              <SelectItem value="PublishedDate-asc">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="author-asc">Author A-Z</SelectItem>
            </SelectContent>
          </Select>

          {(selectedCategory !== "all" || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginationData.items.map((post) => {
            const postUrl = getBlogPostUrl({
              id: post.id as string,
              title: post.title ?? undefined,
              url: post.url ?? undefined,
            });

            return (
              <Card
                key={post.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                {/* Cover image */}
                <div className="relative h-44 w-full bg-gradient-to-br from-emerald-50 to-blue-50 overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title || "Blog post"}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                      <Image
                        src="/placeholder.svg"
                        alt=""
                        fill
                        unoptimized
                        className="object-cover opacity-40"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Category badge (top-left) */}
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-white/95 text-emerald-700 text-xs font-semibold shadow-sm border-0">
                      {post.category || "Uncategorized"}
                    </Badge>
                  </div>

                  {/* Featured badge (top-right) */}
                  {post.featured && (
                    <div className="absolute right-3 top-3">
                      <div className="px-2 py-1 rounded-md bg-amber-500 text-white text-xs font-medium shadow flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" /> Featured
                      </div>
                    </div>
                  )}

                  {/* Author chip (bottom-left) */}
                  {post.author?.name && (
                    <div className="absolute left-3 bottom-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-medium border">
                        <User className="h-3 w-3" /> {post.author.name}
                      </span>
                    </div>
                  )}

                  {/* Read time chip (bottom-right) */}
                  {post.readTime && (
                    <div className="absolute right-3 bottom-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-slate-800 text-xs font-medium border">
                        {post.readTime}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="flex h-full flex-1 flex-col p-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={post.publishedAt || undefined}>
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                    <Link href={postUrl} className="ml-auto">
                      <Button size="sm">
                        Read more <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {paginationData.items.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500">
            No blog posts found. Try adjusting your search or filters.
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8">
          <DataTablePagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            pageSize={paginationData.pageSize}
            totalItems={paginationData.totalItems}
            hasNextPage={paginationData.hasNextPage}
            hasPreviousPage={paginationData.hasPreviousPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
