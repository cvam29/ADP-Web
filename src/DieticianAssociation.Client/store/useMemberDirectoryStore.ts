"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiClient } from "@/services/api-client";
import { handleError } from "./storeUtils";

export interface MemberDirectoryItem {
  id: string;
  name: string;
  avatar?: string | null;
  designation?: string | null;
  organization?: string | null;
  specializations?: string[] | null;
  membershipTier: string;
  joinDate: string;
}

export interface MemberDirectoryFacet {
  name: string;
  count: number;
}

export interface MemberDirectoryResponse {
  items: MemberDirectoryItem[];
  totalCount: number;
  membershipTiers: MemberDirectoryFacet[];
}

export interface MemberDirectoryQueryParams {
  q?: string;
  limit?: number;
  offset?: number;
  filter_membershipTier?: string;
  sortBy?: string;
}

interface MemberDirectoryState {
  members: MemberDirectoryItem[];
  membershipTiers: MemberDirectoryFacet[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  fetchDirectory: (params?: MemberDirectoryQueryParams) => Promise<void>;
  clearError: () => void;
  clearMessage: () => void;
}

export const useMemberDirectoryStore = create<MemberDirectoryState>()(
  devtools((set) => ({
    members: [],
    membershipTiers: [],
    totalCount: 0,
    loading: false,
    error: null,
    success: false,
    message: null,

    fetchDirectory: async (params) => {
      set({ loading: true, error: null, success: false, message: null });

      try {
        const response = await apiClient<MemberDirectoryResponse>({
          url: "/api/search/member-directory",
          method: "GET",
          params,
        });

        set({
          members: response.data.items ?? [],
          membershipTiers: response.data.membershipTiers ?? [],
          totalCount: response.data.totalCount ?? 0,
          loading: false,
          success: true,
          message: "Member directory loaded successfully",
        });
      } catch (err) {
        set({
          loading: false,
          error: handleError(err),
          success: false,
        });
      }
    },

    clearError: () => set({ error: null }),
    clearMessage: () => set({ message: null }),
  }))
);