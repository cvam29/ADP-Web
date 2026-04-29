import { ProtectedRoute } from "@/components/protected-route"
import { ProfileSettings } from "@/components/profile-settings"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage your account information and preferences.</p>
            </div>
          </div>
          <ProfileSettings />
        </div>
      </div>
    </ProtectedRoute>
  )
}
