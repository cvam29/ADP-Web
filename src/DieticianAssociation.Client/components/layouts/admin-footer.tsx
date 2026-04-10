"use client"
import Link from "next/link"
import Image from "next/image"
import { Shield, Users, BarChart3, Settings, Mail, Phone } from "lucide-react"

export function AdminFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Admin Info */}
          {/* <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image
                  src="/ADP.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-cover rounded-lg filter brightness-0 invert"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">ADP Admin</span>
                <span className="text-xs text-gray-500">Administration Panel</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Comprehensive administration tools for managing the Association of Dietetics Professionals platform.
            </p>
          </div> */}

          {/* Admin Tools */}
          {/* <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Admin Tools
            </h3>
            <ul className="space-y-2">
              {[
                { name: "User Management", href: "/admin/users", icon: Users },
                { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
                { name: "System Settings", href: "/admin/settings", icon: Settings },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-black transition-colors text-sm flex items-center"
                  >
                    <item.icon className="w-3 h-3 mr-2" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Quick Actions */}
          {/* <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Actions</h3>
            <ul className="space-y-2">
              {[
                "Content Management",
                "Event Management",
                "Certificate Management",
                "Email Campaigns",
                "System Logs",
                "Backup & Restore",
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-500 hover:text-black text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Support */}
          {/* <div className="space-y-4">
            <h3 className="font-semibold text-lg">Admin Support</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 text-sm">admin@adp.org.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 text-sm">+91 80596 55000 (Ext: 101)</span>
              </div>
            </div>
          </div> */}
        </div>

        <div className="row">
          <div className="col-12 text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} ADP Admin Panel. All rights reserved.</p>
            {/* <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/admin/privacy" className="text-gray-500 hover:text-black text-sm transition-colors">
                Admin Privacy
              </Link>
              <Link href="/admin/security" className="text-gray-500 hover:text-black text-sm transition-colors">
                Security Policy
              </Link>
              <Link href="/admin/help" className="text-gray-500 hover:text-black text-sm transition-colors">
                Admin Help
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  )
}
