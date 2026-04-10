"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getDieticianAssociationAPI,
  type CreateContactMessageDto,
  type ContactMessageDto,
  type UpdateMessageStatusDto,
  type PagedRequest,
  type ContactMessageDtoPagedResult,
} from "../services/generated";
import { handleError } from "./storeUtils";
import { toast } from "@/hooks/use-toast";

const api = getDieticianAssociationAPI();

interface ContactState {
  messages: ContactMessageDto[];
  pagedResult?: ContactMessageDtoPagedResult;
  currentMessage?: ContactMessageDto;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null; // user-facing status message

  // actions
  sendMessage: (data: CreateContactMessageDto) => Promise<ContactMessageDto>;
  fetchMessages: (params?: ContactPagedParams) => Promise<void>;
  fetchMessage: (id: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  removeError: () => void;
  clearMessage: () => void;
}

// Backward-compatible type to support callers that might use capitalized keys
type ContactPagedParams = PagedRequest & {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
  Filters?: { [key: string]: unknown };
  Skip?: number;
  IsValid?: boolean;
};

// Normalize to PagedRequest as expected by postApiContactPaginated
const normalizePagedParams = (params?: ContactPagedParams): PagedRequest => {
  if (!params) return {};
  const { Page, PageSize, Search, SortBy, SortDirection, Filters, ...rest } =
    params as ContactPagedParams;
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

export const useContactStore = create<ContactState>()(
  devtools((set, get) => ({
    messages: [],
    pagedResult: undefined,
    currentMessage: undefined,
    loading: false,
    error: null,
    success: false,
    message: null,

    sendMessage: async (data) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.postApiContact(data);
        // If list already fetched, append optimistically
        const existing = get().messages ?? [];
        set({
          messages: [...existing, res.data],
          loading: false,
          success: true,
          message: "Message sent successfully",
        });

        toast({
          title: "Success",
          description: "Message sent successfully",
          variant: "success",
        });

        return res.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });
        toast({
          title: "Contact Error",
            description: error,
            variant: "error",
        });
        throw err;
      }
    },

    fetchMessages: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        // If params provided, use paginated endpoint; else fall back to simple list
        if (params && Object.keys(params).length > 0) {
          const res = await api.postApiContactPaginated(
            normalizePagedParams(params)
          );
          set({
            messages: res.data.items ?? [],
            pagedResult: res.data,
            loading: false,
            success: true,
            message: "Contact messages fetched successfully",
          });
        } else {
          const res = await api.getApiContact();
          set({
            messages: res.data ?? [],
            pagedResult: undefined,
            loading: false,
            success: true,
            message: "Contact messages fetched successfully",
          });
        }
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({
          title: "Contact Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchMessage: async (id) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.getApiContactId(id);
        set({
          currentMessage: res.data,
          loading: false,
          success: true,
          message: "Contact message fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({
          title: "Contact Error",
          description: error,
          variant: "error",
        });
      }
    },

    updateStatus: async (id, status) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const payload: UpdateMessageStatusDto = { status };
        const res = await api.putApiContactIdStatus(id, payload);
        set((state) => {
          const updated = res.data;
          const updatedMessages = state.messages.map((m) =>
            m.id === id ? { ...m, ...updated } : m
          );
          const updatedPaged = state.pagedResult
            ? {
                ...state.pagedResult,
                items: state.pagedResult.items?.map((m) =>
                  m?.id === id ? { ...m, ...updated } : m
                ),
              }
            : state.pagedResult;
          const updatedCurrent = state.currentMessage?.id === id ? { ...state.currentMessage, ...updated } : state.currentMessage;
          return {
            messages: updatedMessages,
            pagedResult: updatedPaged,
            currentMessage: updatedCurrent,
            loading: false,
            success: true,
            message: "Status updated successfully",
          };
        });

        toast({
          title: "Success",
          description: "Status updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({
          title: "Contact Error",
          description: error,
          variant: "error",
        });
        throw err;
      }
    },

    deleteMessage: async (id) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiContactId(id);
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
          pagedResult: state.pagedResult
            ? {
                ...state.pagedResult,
                items: state.pagedResult.items?.filter((m) => m?.id !== id) ?? [],
                totalItems: (state.pagedResult.totalItems ?? 0) > 0
                  ? (state.pagedResult.totalItems as number) - 1
                  : state.pagedResult.totalItems,
              }
            : state.pagedResult,
          currentMessage: state.currentMessage?.id === id ? undefined : state.currentMessage,
          loading: false,
          success: true,
          message: "Message deleted successfully",
        }));
        toast({
          title: "Success",
          description: "Message deleted successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({
          title: "Contact Error",
          description: error,
          variant: "error",
        });
      }
    },

    removeError: () => set({ error: null }),
    clearMessage: () => set({ message: null, success: false }),
  }))
);
