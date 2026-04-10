"use client";

import { MemberResourceComingSoon } from "@/components/dashboard/member-resource-coming-soon";
import { ProtectedRoute } from "@/components/protected-route";

export default function CareerCenterPage() {
  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.career.access"]}>
      <MemberResourceComingSoon
        title="Career Center"
        description="ADP is preparing member-focused career pathways, placement support, and role discovery tools for this section."
      />
    </ProtectedRoute>
  );
}