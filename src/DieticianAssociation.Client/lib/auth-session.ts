"use client";

import type { UserDto } from "@/services/generated";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/useAuthStore";

export async function refreshCurrentUserSession(): Promise<UserDto | undefined> {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) {
    return undefined;
  }

  const response = await apiClient<UserDto>({
    url: "/api/auth/me",
    method: "GET",
  });

  const user = response.data;
  useAuthStore.getState().syncCurrentUser(user);
  return user;
}