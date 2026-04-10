"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getDieticianAssociationAPI,
  PermissionDto,
  SetTemporaryPasswordDto,
  UserDto,
  UserPermissionsDto,
  PagedRequest,
  UserDtoPagedResult,
  CreateUserDto,
  UpdateUserDto,
  UpdateRoleDto,
  UpdateMembershipDto,
  UpdateStatusDto,
  UpdateUserPermissionsDto,
} from "../services/generated";
import { handleError } from "./storeUtils";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api-client";

const api = getDieticianAssociationAPI();

interface UserState {
  users: UserDto[];
  pagedResult?: UserDtoPagedResult;
  userDetail?: any;
  permissionCatalog: PermissionDto[];
  userPermissions?: UserPermissionsDto;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;

  // API actions
  updateUserMembership: (
    id: string,
    data: UpdateMembershipDto
  ) => Promise<void>;
  updateRole: (id: string, data: UpdateRoleDto) => Promise<void>;
  fetchPermissionCatalog: () => Promise<PermissionDto[]>;
  fetchUserPermissions: (id: string) => Promise<UserPermissionsDto | undefined>;
  updateUserPermissions: (id: string, data: UpdateUserPermissionsDto) => Promise<UserPermissionsDto | undefined>;
  updateStatus: (id: string, data: UpdateStatusDto) => Promise<void>;
  updatePaymentStatus: (paymentId: string, status: number) => Promise<void>;
  setTemporaryPassword: (
    id: string,
    data: {
      temporaryPassword: string;
      sendEmail?: boolean;
      bccSupport?: boolean;
      supportEmail?: string;
      requirePasswordReset?: boolean;
    }
  ) => Promise<void>;
  fetchUsers: (params?: PagedRequest) => Promise<void>;
  fetchUserDetail: (id: string) => Promise<void>;
  createUser: (user: CreateUserDto) => Promise<UserDto>;
  updateUser: (id: string, user: Partial<UpdateUserDto>) => Promise<UserDto>;
  deleteUser: (id: string) => Promise<void>;
  permanentDeleteUser: (id: string) => Promise<void>;
  removeError: () => void;
  clearMessage: () => void;
}

export const useUserStore = create<UserState>()(
  devtools((set, get) => ({
    users: [],
    pagedResult: undefined,
    userDetail: undefined,
    permissionCatalog: [],
    userPermissions: undefined,
    loading: false,
    error: null,
    success: false,
    message: null,

    fetchUsers: async (params: PagedRequest) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.postApiUsersGetusers(params);
        set({
          users: result.data.items ?? [],
          pagedResult: result.data,
          loading: false,
          success: true,
          message: "Users fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchUserDetail: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const response = await api.getApiUsersIdDetail(id);
        set({ userDetail: response.data, loading: false });
      } catch (error) {
        const errorMessage = handleError(error);
        set({ error: errorMessage, loading: false });
        toast({
          title: "Error",
          description: errorMessage,
          variant: "error",
        });
      }
    },

    createUser: async (user: CreateUserDto) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.postApiUsers(user);
        set((state) => ({
          users: [...state.users, result.data],
          loading: false,
          success: true,
          message: "User created successfully",
        }));

        toast({
          title: "Success",
          description: "User created successfully",
          variant: "success",
        });

        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    updateUser: async (id: string, user: Partial<UpdateUserDto>) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.putApiUsersUserId(id, user);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? result.data : u)),
          loading: false,
          success: true,
          message: "User updated successfully",
        }));

        toast({
          title: "Success",
          description: "User updated successfully",
          variant: "success",
        });

        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    deleteUser: async (id: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiAdminUsersUserId(id);
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          loading: false,
          success: true,
          message: "User deleted successfully",
        }));

        toast({
          title: "Success",
          description: "User deleted successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    permanentDeleteUser: async (id: string) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await apiClient({ method: "delete", url: `/api/admin/users/${id}/permanent` });
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          loading: false,
          success: true,
          message: "User permanently deleted",
        }));

        toast({
          title: "Success",
          description: "User permanently deleted",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    updateUserMembership: async (id, data) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.putApiAdminUsersUserIdMembership(id, data);
        set({
          loading: false,
          success: true,
          message: "Membership updated successfully",
        });

        toast({
          title: "Success",
          description: "Membership updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    updateRole: async (id, data) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.putApiAdminUsersUserIdRole(id, data);
        set({
          loading: false,
          success: true,
          message: "Role updated successfully",
        });

        toast({
          title: "Success",
          description: "Role updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchPermissionCatalog: async () => {
      try {
        const result = await api.getApiAdminPermissions();
        const catalog = result.data ?? [];
        set({ permissionCatalog: catalog });
        return catalog;
      } catch (err) {
        const error = handleError(err);
        set({ error, success: false });

        toast({
          title: "Permission Error",
          description: error,
          variant: "error",
        });

        return [];
      }
    },

    fetchUserPermissions: async (id) => {
      try {
        const result = await api.getApiAdminUsersUserIdPermissions(id);
        set({ userPermissions: result.data });
        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, success: false });

        toast({
          title: "Permission Error",
          description: error,
          variant: "error",
        });

        return undefined;
      }
    },

    updateUserPermissions: async (id, data) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.putApiAdminUsersUserIdPermissions(id, data);
        set({
          userPermissions: result.data,
          loading: false,
          success: true,
          message: "Permissions updated successfully",
        });

        toast({
          title: "Success",
          description: "Permissions updated successfully",
          variant: "success",
        });

        return result.data;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Permission Error",
          description: error,
          variant: "error",
        });

        return undefined;
      }
    },

    updateStatus: async (id, data) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.putApiAdminUsersUserIdStatus(id, data);
        set({
          loading: false,
          success: true,
          message: "Status updated successfully",
        });

        toast({
          title: "Success",
          description: "Status updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "User Error",
          description: error,
          variant: "error",
        });
      }
    },

    updatePaymentStatus: async (paymentId: string, status: number) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.putApiUsersPaymentsPaymentIdStatus(paymentId, { status: status as any });
        set({
          loading: false,
          success: true,
          message: "Payment status updated successfully",
        });

        toast({
          title: "Success",
          description: "Payment status updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Payment Error",
          description: error,
          variant: "error",
        });
      }
    },

    setTemporaryPassword: async (id, data) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const payload: SetTemporaryPasswordDto = {
            temporaryPassword: data.temporaryPassword,
            requirePasswordReset: data.requirePasswordReset ?? true,
            sendEmail: data.sendEmail ?? true,
            bccSupport: data.bccSupport ?? false,
            supportEmail: data.supportEmail,
        };

        await api.putApiUsersUserIdTemporaryPassword(id, payload);

        set({
          loading: false,
          success: true,
          message: "Temporary password updated successfully",
        });

        toast({
          title: "Success",
          description: "Temporary password updated successfully",
          variant: "success",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Password Update Error",
          description: error,
          variant: "error",
        });
      }
    },

    removeError: () => set({ error: null }),
    clearMessage: () => set({ message: null, success: false }),
  }))
);
