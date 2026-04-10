"use client";

import { MemberDirectory } from "@/components/dashboard/member-directory";
import { ProtectedRoute } from "@/components/protected-route";

export default function MemberDirectoryPage() {
  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.directory.access"]}>
      <MemberDirectory />
    </ProtectedRoute>
  );
}