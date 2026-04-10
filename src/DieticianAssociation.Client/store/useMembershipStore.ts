"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getDieticianAssociationAPI,
  MembershipPlanDto,
  MembershipRegistrationResultDto,
  CreateMembershipPlanDto,
  PostApiMembershipRegisterBody,
  UserMembershipDto,
  UserMembershipDtoPagedResult,
} from "../services/generated";
import { handleError, cachedFetch, invalidateCache } from "./storeUtils";
import { toast } from "@/hooks/use-toast";

const api = getDieticianAssociationAPI();

interface MembershipState {
  memberships: MembershipPlanDto[];
  selectedMembership?: MembershipPlanDto;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;

  // User Memberships (following Users pattern)
  userMemberships: UserMembershipDto[];
  userMembershipsPagedResult?: UserMembershipDtoPagedResult;

  // API actions
  fetchMemberships: () => Promise<void>;
  fetchMembershipById: (id: string) => Promise<MembershipPlanDto | undefined>;
  createMembership: (data: CreateMembershipPlanDto) => Promise<MembershipPlanDto | undefined>;
  updateMembership: (id: string, data: CreateMembershipPlanDto) => Promise<MembershipPlanDto | undefined>;
  deleteMembership: (id: string) => Promise<void>;
  registerMembership: (data: PostApiMembershipRegisterBody) => Promise<MembershipRegistrationResultDto | undefined>;
  checkEmailAvailability: (email: string) => Promise<boolean>;

  // User Membership Actions (following Users pattern)
  fetchUserMemberships: (params: any) => Promise<void>;
  fetchUserMembershipById: (id: string) => Promise<UserMembershipDto | undefined>;
  updateUserMembershipStatus: (id: string, data: any) => Promise<void>;
  updateUserMembershipPlan: (id: string, membershipPlanId: string) => Promise<void>;
  deleteUserMembership: (id: string) => Promise<void>;
  permanentDeleteUserMembership: (id: string) => Promise<void>;

  removeError: () => void;
  clearMessage: () => void;
}

export const useMembershipStore = create<MembershipState>()(
  devtools((set, get) => ({
    memberships: [],
    selectedMembership: undefined,
    loading: false,
    error: null,
    success: false,
    message: null,

    fetchMemberships: async () => {
      if (get().memberships.length > 0) return;
      set({ loading: true, error: null, success: false, message: null });
      try {
        const memberships = await cachedFetch<MembershipPlanDto[]>(
          'membership:plans',
          async () => {
            const result = await api.getApiMembershipPlans();
            return result.data ?? [];
          },
          2 * 60_000 // 2 minutes
        );
        set({
          memberships,
          loading: false,
          success: true,
          message: "Membership plans fetched successfully",
        });

        // toast({
        //   title: "Success",
        //   description: "Membership plans loaded",
        //   variant: "success",
        // });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchMembershipById: async (id: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.getApiMembershipPlansPlanId(id);
        set({
          selectedMembership: result.data,
          loading: false,
          success: true,
          message: "Membership plan fetched successfully",
        });
        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    createMembership: async (data: CreateMembershipPlanDto) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.postApiMembershipPlans(data);
        invalidateCache('membership');
        set((state) => ({
          memberships: [...state.memberships, result.data],
          loading: false,
          success: true,
          message: "Membership plan created successfully",
        }));

        toast({
          title: "Success",
          description: "Membership plan created successfully",
          variant: "success",
        });

        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },
    
    registerMembership: async (data: PostApiMembershipRegisterBody) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.postApiMembershipRegister(data);
        const response = result.data;
        set({
          loading: false,
          success: true,
          message: response?.message ?? "Membership application submitted successfully",
        });

        toast({
          title: "Success",
          description: response?.message ?? "Membership application submitted successfully",
          variant: "success",
        });

        return response;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership application Error",
          description: error,
          variant: "error",
        });

        return undefined;
      }
    },

    checkEmailAvailability: async (email: string) => {
      const normalizedEmail = email.trim();
      if (!normalizedEmail) return true;

      try {
        const result = await api.getApiUsersByEmail(
          { email: normalizedEmail },
          { validateStatus: (status) => status === 200 || status === 404 }
        );

        return result.status === 404;
      } catch (err) {
        throw new Error(handleError(err));
      }
    },

    updateMembership: async (id: string, data: CreateMembershipPlanDto) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.putApiMembershipPlansPlanId(id, data);
        invalidateCache('membership');
        set((state) => ({
          memberships: state.memberships.map((m) =>
            m.id === id ? result.data : m
          ),
          loading: false,
          success: true,
          message: "Membership plan updated successfully",
        }));

        toast({
          title: "Success",
          description: "Membership plan updated successfully",
          variant: "success",
        });

        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    deleteMembership: async (id: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiMembershipPlansPlanId(id);
        invalidateCache('membership');
        set((state) => ({
          memberships: state.memberships.filter((m) => m.id !== id),
          loading: false,
          success: true,
          message: "Membership plan deleted successfully",
        }));

        toast({
          title: "Success",
          description: "Membership plan deleted successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    // User Membership Management Actions
    fetchUserMemberships: async (params: any) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.postApiMembershipUsers(params);
        set({
          userMemberships: result.data.items ?? [],
          userMembershipsPagedResult: result.data,
          loading: false,
          success: true,
          message: "User memberships fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchUserMembershipById: async (id: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.getApiMembershipUsersId(id);
        set({
          loading: false,
          success: true,
          message: "User membership fetched successfully",
        });
        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    updateUserMembershipStatus: async (id: string, data: any) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.putApiMembershipUsersIdStatus(id, data);
        set({
          loading: false,
          success: true,
          message: "Membership status updated successfully",
        });

        toast({
          title: "Success",
          description: "Membership status updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    deleteUserMembership: async (id: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiMembershipUsersId(id);
        set((state) => ({
          userMemberships: state.userMemberships.filter((m) => m.id !== id),
          loading: false,
          success: true,
          message: "User membership deleted successfully",
        }));

        toast({
          title: "Success",
          description: "User membership deleted successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    updateUserMembershipPlan: async (id: string, membershipPlanId: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.putApiMembershipUsersIdPlan(id, { membershipPlanId });
        set({
          loading: false,
          success: true,
          message: "Membership plan updated successfully",
        });

        toast({
          title: "Success",
          description: "Membership plan updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    permanentDeleteUserMembership: async (id: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiMembershipUsersIdPermanent(id);
        set((state) => ({
          userMemberships: state.userMemberships.filter((m) => m.id !== id),
          loading: false,
          success: true,
          message: "Membership permanently deleted",
        }));

        toast({
          title: "Success",
          description: "Membership permanently deleted",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "Membership Error",
          description: error,
          variant: "error",
        });
      }
    },

    removeError: () => set({ error: null }),
    clearMessage: () => set({ message: null, success: false }),
  }))
);
