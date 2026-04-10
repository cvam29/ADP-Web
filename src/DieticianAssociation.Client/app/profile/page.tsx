import { ProtectedRoute } from "@/components/protected-route"
import { ProfileSettings } from "@/components/profile-settings"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your account information and preferences.</p>
            </div>
          </div>
          <ProfileSettings />
        </div>
      </div>
    </ProtectedRoute>
  )
}
