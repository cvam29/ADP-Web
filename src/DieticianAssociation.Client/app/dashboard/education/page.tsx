"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { EducationPage } from "@/app/education/page";

export default function DashboardEducationPage() {
  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.dashboard.access"]}>
      <EducationPage />
    </ProtectedRoute>
  );
}