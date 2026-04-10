"use client";
import type React from "react";
import { GuestLayout } from "./guest-layout";
import { UserLayout } from "./user-layout";
import { AdminLayout } from "./admin-layout";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { PageLoading } from "@/components/page-loading";
import { useAdminGuard } from "@/hooks/use-admin-guard";

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

import { useEffect, useState } from "react";

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { isHydrated } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const currentPath = pathname || "";
  const isAdminRoute = currentPath.startsWith("/admin");
  const isDashboardRoute = currentPath.startsWith("/dashboard");
  const isProfileRoute = currentPath === "/profile" || currentPath.startsWith("/profile/");

  // Mount gate to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dedicated guard for /admin paths (works even if user is not admin to prevent content flash)
  if (isAdminRoute) {
    return <AdminSection>{children}</AdminSection>;
  }

  // Wait for both React hydration and auth hydration before checking roles
  if (!mounted || !isHydrated) {
    return <PageLoading direction="column" message="Loading..." minHeightClassName="min-h-screen" />;
  }

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  if (isProfileRoute)
    return <UserLayout>{children}</UserLayout>;

  return <GuestLayout>{children}</GuestLayout>;
}

function AdminSection({ children }: { children: React.ReactNode }) {
  const { isAdmin, checking } = useAdminGuard();

  if (checking) {
    return <PageLoading direction="column" message="Verifying access..." minHeightClassName="min-h-screen" />;
  }
  if (!isAdmin) {
    // useAdminGuard already triggered redirect; avoid flashing content.
    return null;
  }
  return <AdminLayout>{children}</AdminLayout>;
}
