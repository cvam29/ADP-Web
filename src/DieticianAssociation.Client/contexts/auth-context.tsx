"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  ChangePasswordDto,
  UserDto,
  UpdateRoleDtoRole,
  LoginRequestDto,
  RegisterRequestDto,
} from "@/services/generated";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useIsHydrated } from "@/hooks/use-hydration";
import { useRouter } from "next/navigation";
import { refreshCurrentUserSession } from "../lib/auth-session";
import { clearViewAsRestoreSession } from "@/lib/view-as-session";

const clearAuthStorage = () => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("authToken");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("mustResetPassword");
  clearViewAsRestoreSession();
};

interface AuthContextType {
  user: UserDto | null;
  mustResetPassword: boolean;
  isViewingAs: boolean;
  viewAsAdminUser: UserDto | null;
  login: (credentials: LoginRequestDto) => Promise<boolean>;
  register: (data: RegisterRequestDto) => Promise<boolean>;
  changePassword: (data: ChangePasswordDto) => Promise<boolean>;
  startViewAs: (targetUserId: string) => Promise<boolean>;
  exitViewAs: () => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  hasRole: (role: UpdateRoleDtoRole) => boolean;
  hasAnyRole: (roles: UpdateRoleDtoRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasActiveMembership: () => boolean;
  isHydrated: boolean;
}

const normalizeMembershipStatus = (status?: string | null) =>
  status?.trim().toLowerCase() ?? "";

export const userHasActiveMembership = (user: UserDto | null | undefined) =>
  normalizeMembershipStatus(user?.membership?.status) === "active";

const normalizePermission = (permission?: string | null) =>
  permission?.trim().toLowerCase() ?? "";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user: storeUser,
    mustResetPassword,
    isViewingAs,
    viewAsAdminUser,
    loginUser,
    registerUser,
    changePassword: changeStorePassword,
    hydratePersistedSession,
    startViewAs: startViewAsStore,
    exitViewAs: exitViewAsStore,
    logout: storeLogout,
    loading,
    error,
    message,
  } = useAuthStore();

  const isHydrated = useIsHydrated();
  const [sessionRestored, setSessionRestored] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // 🚀 Hydrate store from localStorage once
  useEffect(() => {
    if (!isHydrated) return;

    hydratePersistedSession();
    const tokenRaw = localStorage.getItem("authToken");
    if (tokenRaw) {
      refreshCurrentUserSession()
        .catch(() => undefined)
        .finally(() => setSessionRestored(true));
    }

    if (!tokenRaw) {
      setSessionRestored(true);
    }
  }, [hydratePersistedSession, isHydrated]);

  const user: UserDto | null = storeUser ?? null;

  // ✅ Toast notifications
  useEffect(() => {
    if (!isHydrated) return;
    if (message) {
      toast({
        title: error ? "Auth Error" : "Success",
        description: message,
        variant: error ? "error" : "success",
      });
      useAuthStore.setState({ message: undefined, error: undefined });
    }
  }, [message, error, toast, isHydrated]);

  // 🔑 Login
  const login = async (credentials: LoginRequestDto): Promise<boolean> => {
    return loginUser(credentials);
  };

  // 📝 Register
  const register = async (data: RegisterRequestDto): Promise<boolean> => {
    return registerUser(data);
  };

  const changePassword = async (data: ChangePasswordDto): Promise<boolean> => {
    const success = await changeStorePassword(data);
    return success;
  };

  const startViewAs = async (targetUserId: string): Promise<boolean> => {
    const success = await startViewAsStore(targetUserId);
    return success;
  };

  const exitViewAs = async (): Promise<boolean> => {
    const success = await exitViewAsStore();
    if (!success) {
      return false;
    }

    await refreshCurrentUserSession().catch(() => undefined);
    router.push("/admin");
    return true;
  };

  // 🚪 Logout
  const logout = () => {
    storeLogout();
    clearAuthStorage();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    window.location.href = "/";
  };

  const hasRole = (role: UpdateRoleDtoRole) => {
    if (user?.roleId === undefined || user?.roleId === null) {
      return false;
    }

    return Number(user.roleId) === role;
  }

  const hasAnyRole = (roles: UpdateRoleDtoRole[]) => {
    if (user?.roleId === undefined || user?.roleId === null) return false;
    return roles.includes(user.roleId as unknown as UpdateRoleDtoRole);
  };

  const hasPermission = (permission: string) => {
    const normalizedTarget = normalizePermission(permission);
    if (!normalizedTarget) {
      return false;
    }

    return (user?.effectivePermissions ?? []).some(
      (value) => normalizePermission(value) === normalizedTarget,
    );
  };

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasActiveMembership = () => userHasActiveMembership(user);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        mustResetPassword,
        isViewingAs,
        viewAsAdminUser: viewAsAdminUser ?? null,
        login,
        register,
        changePassword,
        startViewAs,
        exitViewAs,
        logout,
        loading: loading || !isHydrated || !sessionRestored,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        hasActiveMembership,
        isHydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
