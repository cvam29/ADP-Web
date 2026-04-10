"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiClient } from "@/services/api-client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "./storeUtils";
import type {
  CreateTestimonialDto,
  ReviewTestimonialDto,
  TestimonialDto,
  TestimonialPagedParams,
  TestimonialPagedResult,
} from "@/types/testimonials";

interface TestimonialState {
  publicTestimonials: TestimonialDto[];
  myTestimonials: TestimonialDto[];
  adminTestimonials: TestimonialDto[];
  publicPagedResult?: TestimonialPagedResult;
  adminPagedResult?: TestimonialPagedResult;
  loading: boolean;
  submitting: boolean;
  reviewing: boolean;
  deleting: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  fetchPublicTestimonials: (
    params?: TestimonialPagedParams,
  ) => Promise<TestimonialPagedResult>;
  fetchMyTestimonials: () => Promise<TestimonialDto[]>;
  fetchAdminTestimonials: (
    params?: TestimonialPagedParams,
  ) => Promise<TestimonialPagedResult>;
  submitTestimonial: (payload: CreateTestimonialDto) => Promise<TestimonialDto>;
  reviewTestimonial: (
    id: string,
    payload: ReviewTestimonialDto,
  ) => Promise<TestimonialDto>;
  deleteTestimonial: (id: string) => Promise<void>;
  clearMessage: () => void;
  removeError: () => void;
}

const normalizePagedParams = (
  params?: TestimonialPagedParams,
): Record<string, unknown> => {
  if (!params) {
    return {
      page: 1,
      pageSize: 10,
      sortDirection: "desc",
    };
  }

  const { Page, PageSize, Search, SortBy, SortDirection, Filters, ...rest } =
    params;

  return {
    ...rest,
    page: params.page ?? Page ?? 1,
    pageSize: params.pageSize ?? PageSize ?? 10,
    search: params.search ?? Search,
    sortBy: params.sortBy ?? SortBy,
    sortDirection: params.sortDirection ?? SortDirection ?? "desc",
    filters: params.filters ?? Filters,
  };
};

export const useTestimonialStore = create<TestimonialState>()(
  devtools((set, get) => ({
    publicTestimonials: [],
    myTestimonials: [],
    adminTestimonials: [],
    publicPagedResult: undefined,
    adminPagedResult: undefined,
    loading: false,
    submitting: false,
    reviewing: false,
    deleting: false,
    error: null,
    success: false,
    message: null,

    fetchPublicTestimonials: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const response = await apiClient<TestimonialPagedResult>({
          url: "/api/testimonials/paginated",
          method: "POST",
          data: normalizePagedParams(params),
        });

        set({
          publicTestimonials: response.data.items ?? [],
          publicPagedResult: response.data,
          loading: false,
          success: true,
          message: "Testimonials fetched successfully",
        });

        return response.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });
        throw err;
      }
    },

    fetchMyTestimonials: async () => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const response = await apiClient<TestimonialDto[]>({
          url: "/api/testimonials/mine",
          method: "GET",
        });

        set({
          myTestimonials: response.data ?? [],
          loading: false,
          success: true,
          message: "Your testimonials fetched successfully",
        });

        return response.data ?? [];
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });
        throw err;
      }
    },

    fetchAdminTestimonials: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const response = await apiClient<TestimonialPagedResult>({
          url: "/api/testimonials/admin/paginated",
          method: "POST",
          data: normalizePagedParams(params),
        });

        set({
          adminTestimonials: response.data.items ?? [],
          adminPagedResult: response.data,
          loading: false,
          success: true,
          message: "Admin testimonials fetched successfully",
        });

        return response.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });
        throw err;
      }
    },

    submitTestimonial: async (payload) => {
      set({ submitting: true, error: null, success: false, message: null });
      try {
        const response = await apiClient<TestimonialDto>({
          url: "/api/testimonials/submit",
          method: "POST",
          data: payload,
        });

        set((state) => ({
          myTestimonials: [response.data, ...state.myTestimonials],
          submitting: false,
          success: true,
          message: "Testimonial submitted for review",
        }));

        toast({
          title: "Submission received",
          description: "Your testimonial is now pending admin review.",
          variant: "success",
        });

        return response.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, submitting: false, success: false });
        toast({
          title: "Unable to submit testimonial",
          description: error,
          variant: "error",
        });
        throw err;
      }
    },

    reviewTestimonial: async (id, payload) => {
      set({ reviewing: true, error: null, success: false, message: null });
      try {
        const response = await apiClient<TestimonialDto>({
          url: `/api/testimonials/${id}/review`,
          method: "PUT",
          data: payload,
        });

        set((state) => ({
          adminTestimonials: state.adminTestimonials.map((testimonial) =>
            testimonial.id === id ? response.data : testimonial,
          ),
          myTestimonials: state.myTestimonials.map((testimonial) =>
            testimonial.id === id ? response.data : testimonial,
          ),
          publicTestimonials:
            response.data.status === "Approved"
              ? [response.data, ...state.publicTestimonials.filter((testimonial) => testimonial.id !== id)]
              : state.publicTestimonials.filter((testimonial) => testimonial.id !== id),
          reviewing: false,
          success: true,
          message: "Testimonial updated successfully",
        }));

        toast({
          title: "Moderation saved",
          description: `Testimonial marked as ${response.data.status}.`,
          variant: "success",
        });

        const page = get().adminPagedResult?.page ?? 1;
        const pageSize = get().adminPagedResult?.pageSize ?? 10;
        void get().fetchAdminTestimonials({ page, pageSize });

        return response.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, reviewing: false, success: false });
        toast({
          title: "Unable to review testimonial",
          description: error,
          variant: "error",
        });
        throw err;
      }
    },

    deleteTestimonial: async (id) => {
      set({ deleting: true, error: null, success: false, message: null });
      try {
        await apiClient({
          url: `/api/testimonials/${id}`,
          method: "DELETE",
        });

        set((state) => ({
          adminTestimonials: state.adminTestimonials.filter((testimonial) => testimonial.id !== id),
          myTestimonials: state.myTestimonials.filter((testimonial) => testimonial.id !== id),
          publicTestimonials: state.publicTestimonials.filter((testimonial) => testimonial.id !== id),
          deleting: false,
          success: true,
          message: "Testimonial deleted successfully",
        }));

        toast({
          title: "Testimonial deleted",
          description: "The testimonial has been permanently removed.",
          variant: "success",
        });

        const page = get().adminPagedResult?.page ?? 1;
        const pageSize = get().adminPagedResult?.pageSize ?? 10;
        void get().fetchAdminTestimonials({ page, pageSize });
      } catch (err) {
        const error = handleError(err);
        set({ error, deleting: false, success: false });
        toast({
          title: "Unable to delete testimonial",
          description: error,
          variant: "error",
        });
        throw err;
      }
    },

    clearMessage: () => set({ message: null, success: false }),
    removeError: () => set({ error: null }),
  })),
);