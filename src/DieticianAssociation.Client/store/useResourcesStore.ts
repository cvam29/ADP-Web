"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getDieticianAssociationAPI,
  type ResourceDto,
  type ResourceDtoPagedResult,
  type CreateResourceDto,
  type PagedRequest,
} from "../services/generated";
import { handleError } from "./storeUtils";
import { toast } from "@/hooks/use-toast";

const api = getDieticianAssociationAPI();

interface ResourcesState {
  resources: ResourceDto[];
  pagedResult?: ResourceDtoPagedResult;
  categories: string[];
  formats: string[];
  currentResource?: ResourceDto;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;

  // API actions
  // Accept both new (pagedRequest) and legacy (capitalized) param shapes for backward compatibility
  fetchResources: (params?: ResourcePagedParams) => Promise<ResourceDtoPagedResult>;
  fetchPublicFreeResources: (
    params?: ResourcePagedParams
  ) => Promise<ResourceDtoPagedResult>;
  fetchResource: (id: string) => Promise<void>;
  createResource: (payload: CreateResourceDto) => Promise<ResourceDto>;
  updateResource: (id: string, payload: CreateResourceDto) => Promise<ResourceDto>;
  deleteResource: (id: string) => Promise<void>;
  // Returns the downloaded file blob (if successful) so UI can trigger browser save
  download: (id: string) => Promise<Blob | undefined>; // protected download (requires auth)
  downloadPublicFree: (id: string) => Promise<Blob | undefined>;
  fetchCategories: () => Promise<void>;
  fetchFormats: () => Promise<void>;
  removeError: () => void;
  clearMessage: () => void;
}

// Backward-compatible type to support old callers using capitalized keys (Page, PageSize, etc.)
type ResourcePagedParams = PagedRequest & {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
  Filters?: { [key: string]: unknown };
  Skip?: number;
  IsValid?: boolean;
};

// Normalize any legacy keys to the new PagedRequest shape expected by postApiResourcesPaginated
const normalizePagedParams = (params?: ResourcePagedParams): PagedRequest => {
  if (!params) return {};
  const { Page, PageSize, Search, SortBy, SortDirection, Filters, ...rest } =
    params as ResourcePagedParams;

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

export const useResourcesStore = create<ResourcesState>()(
  devtools((set, get) => ({
    resources: [],
    pagedResult: undefined,
    categories: [],
    formats: [],
    currentResource: undefined,
    loading: false,
    error: null,
    success: false,
    message: null,

    fetchResources: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiResourcesPaginated(
          normalizePagedParams(params)
        );
        set({
          resources: res.data.items ?? [],
          pagedResult: res.data,
          loading: false,
          success: true,
          message: "Resources fetched successfully",
        });
        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Resources Error", description: error, variant: "error" });
        throw err;
      }
    },

    fetchPublicFreeResources: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiResourcesPublicFreePaginated(
          normalizePagedParams(params)
        );
        set({
          resources: res.data.items ?? [],
          pagedResult: res.data,
          loading: false,
          success: true,
          message: "Public free resources fetched successfully",
        });
        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Resources Error", description: error, variant: "error" });
        throw err;
      }
    },

    fetchResource: async (id) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.getApiResourcesId(id);
        set({
          currentResource: res.data,
          loading: false,
          success: true,
          message: "Resource fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Resources Error", description: error, variant: "error" });
      }
    },

    createResource: async (payload) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiResources(payload);
        set((state) => ({
          resources: [...state.resources, res.data],
          loading: false,
          success: true,
          message: "Resource created successfully",
        }));
        toast({ title: "Success", description: "Resource created successfully" });
        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });
        toast({ title: "Resources Error", description: error, variant: "error" });
        throw err;
      }
    },

    updateResource: async (id, payload) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.putApiResourcesId(id, payload);
        set((state) => ({
          resources: state.resources.map((r) => (r.id === id ? res.data : r)),
          loading: false,
          success: true,
          message: "Resource updated successfully",
        }));
        toast({ title: "Success", description: "Resource updated successfully" });
        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });
        toast({ title: "Resources Error", description: error, variant: "error" });
        throw err;
      }
    },

    deleteResource: async (id) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiResourcesId(id);
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id),
          loading: false,
          success: true,
          message: "Resource deleted successfully",
        }));
        toast({ title: "Success", description: "Resource deleted successfully" });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });
        toast({ title: "Resources Error", description: error, variant: "error" });
      }
    },

    download: async (id) => {
      try {
        // First register/download increment (returns message)
        await api.postApiResourcesIdDownload(id);
        // Then fetch actual file blob
        const fileRes = await api.getApiResourcesIdFile(id);
        toast({ title: "Download", description: "Your download should start shortly." });
        return fileRes.data;
      } catch (err) {
        const error = handleError(err);
        set({ error });
        toast({ title: "Resources Error", description: error, variant: "error" });
      }
    },

    downloadPublicFree: async (id) => {
      try {
        const res = await api.getApiResourcesPublicFreeIdDownload(id);
        toast({ title: "Download", description: "Your download should start shortly." });
        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error });
        toast({ title: "Resources Error", description: error, variant: "error" });
      }
    },

    fetchCategories: async () => {
      try {
        const categories = Array.from(
          new Set((get().resources ?? []).map((r) => r.category).filter(Boolean))
        ) as string[];
        set({ categories });
      } catch (err) {
        const error = handleError(err);
        set({ error });
      }
    },

    fetchFormats: async () => {
      try {
        const formats = Array.from(
          new Set((get().resources ?? []).map((r) => r.format).filter(Boolean))
        ) as string[];
        set({ formats });
      } catch (err) {
        const error = handleError(err);
        set({ error });
      }
    },

    removeError: () => set({ error: null }),
    clearMessage: () => set({ message: null, success: false }),
  }))
);
