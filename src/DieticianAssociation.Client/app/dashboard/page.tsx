"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { UserDashboard } from "@/components/dashboard/UserDashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.dashboard.access"]}>
      <UserDashboard />
    </ProtectedRoute>
  )
}
