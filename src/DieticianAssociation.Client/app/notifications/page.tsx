"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { NotificationCenter } from "@/components/notifications/NotificationCenter"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-slate-600">Stay updated with the latest news and events.</p>
          </div>
          
          <NotificationCenter />
        </div>
      </div>
    </ProtectedRoute>
  )
}
