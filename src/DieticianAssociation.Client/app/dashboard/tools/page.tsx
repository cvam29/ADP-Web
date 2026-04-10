"use client";

import { ProfessionalTools } from "@/components/dashboard/professional-tools";
import { ProtectedRoute } from "@/components/protected-route";

export default function ProfessionalToolsPage() {
  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.tools.access"]}>
      <ProfessionalTools />
    </ProtectedRoute>
  );
}