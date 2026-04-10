
"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getDieticianAssociationAPI,
  type BlogPostDto,
  type BlogPostDtoPagedResult,
  type CreateBlogPostDto,
  type PagedRequest,
} from "../services/generated";
import { handleError } from "./storeUtils";
import { toast } from "@/hooks/use-toast";

const api = getDieticianAssociationAPI();

interface BlogState {
  posts: BlogPostDto[];
  myPosts: BlogPostDto[];
  myPostsPagedResult?: BlogPostDtoPagedResult;
  pagedResult?: BlogPostDtoPagedResult;
  currentPost?: BlogPostDto;
  featured: BlogPostDto[];
  categories: string[];
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;

  // API actions
  // Accept both new (pagedRequest) and legacy (capitalized) param shapes for backward compatibility
  fetchPosts: (params?: BlogPagedParams) => Promise<BlogPostDtoPagedResult>;
  fetchPost: (url: string) => Promise<void>;
  fetchFeatured: (limit?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createPost: (post: CreateBlogPostDto) => Promise<BlogPostDto>;
  updatePost: (id: string, post: CreateBlogPostDto) => Promise<BlogPostDto>;
  deletePost: (id: string) => Promise<void>;
  fetchMyPosts: (params?: BlogPagedParams) => Promise<BlogPostDtoPagedResult>;
  submitEdit: (id: string, post: CreateBlogPostDto) => Promise<BlogPostDto>;
  submitNewPost: (post: CreateBlogPostDto) => Promise<BlogPostDto>;
  removeError: () => void;
  clearMessage: () => void;
}

// Backward-compatible type to support old callers using capitalized keys (Page, PageSize, etc.)
type BlogPagedParams = PagedRequest & {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
  Filters?: { [key: string]: unknown };
  Skip?: number;
  IsValid?: boolean;
};

// Normalize any legacy keys to the new PagedRequest shape expected by postApiBlogPaginated
const normalizePagedParams = (params?: BlogPagedParams): PagedRequest => {
  if (!params) return {};
  const { Page, PageSize, Search, SortBy, SortDirection, Filters, ...rest } =
    params as BlogPagedParams;

  return {
    ...rest,
    page: params.page ?? Page,
    pageSize: params.pageSize ?? PageSize,
    search: params.search ?? Search,
    sortBy: params.sortBy ?? SortBy,
    sortDirection: params.sortDirection ?? SortDirection,
    filters: (params.filters ?? (Filters as any)) as PagedRequest["filters"],
  };
};

export const useBlogStore = create<BlogState>()(
  devtools((set, get) => ({
    posts: [],
    myPosts: [],
    myPostsPagedResult: undefined,
    pagedResult: undefined,
    currentPost: undefined,
    featured: [],
    categories: [],
    loading: false,
    error: null,
    success: false,
    message: null,

    fetchPosts: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiBlogPaginated(normalizePagedParams(params));
        set({
          posts: res.data.items ?? [],
          pagedResult: res.data,
          loading: false,
          success: true,
          message: "Blog posts fetched successfully",
        });
        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });
        throw err;
      }
    },

    fetchPost: async (url) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.getApiBlogByUrlUrl(url);
        set({
          currentPost: res.data,
          loading: false,
          success: true,
          message: "Blog post fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchFeatured: async (limit = 3) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiBlogPaginated({
          page: 1,
          pageSize: limit,
          filters: { featured: true, isPublished: true },
          sortBy: "PublishedDate",
          sortDirection: "desc",
        });
        set({
          featured: res.data.items ?? [],
          loading: false,
          success: true,
          message: "Featured posts fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchCategories: async () => {
      try {
        const categories = Array.from(
          new Set((get().posts ?? []).map((p) => p.category).filter(Boolean))
        ) as string[];
        set({ categories });
      } catch (err) {
        const error = handleError(err);
        set({ error });
      }
    },

    createPost: async (post) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiBlog(post);
        set((state) => ({
          posts: [...state.posts, res.data],
          loading: false,
          success: true,
          message: "Blog post created successfully",
        }));

        toast({
          title: "Success",
          description: "Blog post created successfully",
          variant: "success",
        });

        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });

        throw err;
      }
    },

    updatePost: async (id, post) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.putApiBlogId(id, post);
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? res.data : p)),
          loading: false,
          success: true,
          message: "Blog post updated successfully",
        }));

        toast({
          title: "Success",
          description: "Blog post updated successfully",
          variant: "success",
        });

        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });

        throw err;
      }
    },

    deletePost: async (id) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiBlogId(id);
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
          loading: false,
          success: true,
          message: "Blog post deleted successfully",
        }));

        toast({
          title: "Success",
          description: "Blog post deleted successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });
      }
    },

    removeError: () => set({ error: null }),
    clearMessage: () => set({ message: null, success: false }),

    fetchMyPosts: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiBlogMyPosts(normalizePagedParams(params));
        set({
          myPosts: res.data.items ?? [],
          myPostsPagedResult: res.data,
          loading: false,
          success: true,
          message: "My posts fetched successfully",
        });
        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });
        throw err;
      }
    },

    submitEdit: async (id, post) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.putApiBlogIdSubmitEdit(id, post);
        set((state) => ({
          myPosts: state.myPosts.map((p) => (p.id === id ? res.data : p)),
          loading: false,
          success: true,
          message: "Edit submitted for review",
        }));

        toast({
          title: "Success",
          description: "Your edit has been submitted for admin review",
          variant: "success",
        });

        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });

        throw err;
      }
    },

    submitNewPost: async (post) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiBlogSubmitNew(post);
        set((state) => ({
          myPosts: [res.data, ...state.myPosts],
          loading: false,
          success: true,
          message: "Article submitted for review",
        }));

        toast({
          title: "Success",
          description: "Your article has been submitted for admin review",
          variant: "success",
        });

        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Blog Error",
          description: error,
          variant: "error",
        });

        throw err;
      }
    },
  }))
);
