"use client";

import { MemberResourceComingSoon } from "@/components/dashboard/member-resource-coming-soon";
import { ProtectedRoute } from "@/components/protected-route";

export default function ResearchLibraryPage() {
  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.research.access"]}>
      <MemberResourceComingSoon
        title="Research Library"
        description="ADP is preparing an evidence-focused research space for active members, with curated references and practical summaries."
      />
    </ProtectedRoute>
  );
}