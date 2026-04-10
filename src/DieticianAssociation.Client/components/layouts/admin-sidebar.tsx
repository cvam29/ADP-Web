"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Shield,
  Users,
  BarChart3,
  FileText,
  Calendar,
  Award,
  Bell,
  Mail,
  Send,
  Settings,
  X,
  User,
  LayoutDashboard,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  CreditCard,
  Images,
  UserCheck,
  GraduationCap,
  MessageSquareQuote,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  children?: NavItem[];
}

const adminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  // { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Membership Plans", href: "/admin/membership", icon: CreditCard },
  {
    name: "User Memberships",
    href: "/admin/user-memberships",
    icon: UserCheck,
  },
  { name: "Blogs", href: "/admin/blogs", icon: BookOpen },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { name: "Events", href: "/admin/events", icon: Calendar },
  // { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Resources", href: "/admin/resources", icon: FolderOpen },
  { name: "Media", href: "/admin/media", icon: Images },
  { name: "Contact Messages", href: "/admin/contact", icon: Mail },
  // { name: "Certificates", href: "/admin/certificates", icon: Award },
  // { name: "Notifications", href: "/admin/notifications", icon: Bell },
  {
    name: "Email",
    href: "/admin/emails",
    icon: Mail,
    children: [
      { name: "Templates", href: "/admin/emails", icon: FileText },
      { name: "Outbox", href: "/admin/emails/outbox", icon: Send },
      { name: "Inbox", href: "/admin/emails/inbox", icon: Mail },
    ],
  },
  { name: "Education", href: "/admin/education", icon: GraduationCap },
];

const userNavigation = [
  { name: "Member Workspace", href: "/dashboard", icon: User },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Resources", href: "/resources", icon: BookOpen },
];

export function AdminSidebar({
  isOpen,
  onClose,
  collapsed,
  setCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

  // Auto-expand parent if a child route is active
  useEffect(() => {
    adminNavigation.forEach((item) => {
      if (
        item.children?.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
        )
      ) {
        setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/80 shadow-xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
          collapsed ? "lg:w-16" : "lg:w-64",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:block",
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Admin info */}
        {user && !collapsed && (
          <div className="p-5 border-b border-gray-200/80 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Avatar className="w-11 h-11 ring-2 ring-blue-100 ring-offset-2">
                <AvatarImage
                  src={user.avatar || "/admin-placeholder.avif"}
                  alt={user.name ?? ""}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {user?.name ??
                    ""
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <Badge
                  className="bg-blue-100 text-blue-800 border-blue-200 text-xs mt-1.5 flex items-center w-fit shadow-sm"
                  variant="outline"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-4 space-y-6 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Admin Section */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Administration
              </h3>
            )}
            <div className="space-y-1">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                const hasChildren = item.children && item.children.length > 0;
                const isChildActive =
                  hasChildren &&
                  item.children!.some(
                    (c) =>
                      pathname === c.href || pathname.startsWith(c.href + "/"),
                  );
                const isExpanded = expandedMenus[item.name] ?? false;

                if (hasChildren) {
                  return (
                    <div key={item.name}>
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.name)}
                        className={cn(
                          "w-full group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                          collapsed
                            ? "justify-center px-3 py-3"
                            : "px-4 py-3 space-x-3",
                          isActive || isChildActive
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                            isActive || isChildActive
                              ? "text-blue-600"
                              : "text-gray-500 group-hover:text-gray-700",
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="font-medium flex-1 text-left">
                              {item.name}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-gray-400 transition-transform duration-200",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </>
                        )}
                        {collapsed && (
                          <span className="absolute left-14 hidden whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block">
                            {item.name}
                          </span>
                        )}
                      </button>
                      {!collapsed && (
                        <div
                          className={cn(
                            "ml-6 space-y-1 border-l-2 border-gray-200 pl-3 overflow-hidden transition-all duration-200",
                            isExpanded
                              ? "max-h-96 mt-1 opacity-100"
                              : "max-h-0 opacity-0",
                          )}
                        >
                          {item.children!.map((child) => {
                            const isChildItemActive = pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={onClose}
                                className={cn(
                                  "group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2 space-x-2",
                                  isChildItemActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-900",
                                )}
                              >
                                <child.icon
                                  className={cn(
                                    "w-4 h-4 flex-shrink-0",
                                    isChildItemActive
                                      ? "text-blue-600"
                                      : "text-gray-400",
                                  )}
                                />
                                <span>{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                      collapsed
                        ? "justify-center px-3 py-3"
                        : "px-4 py-3 space-x-3",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-700",
                      )}
                    />
                    {!collapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                    {collapsed && (
                      <span className="absolute left-14 hidden whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Personal Section */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Workspace
              </h3>
            )}
            <div className="space-y-1">
              {userNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                      collapsed
                        ? "justify-center px-3 py-3"
                        : "px-4 py-3 space-x-3",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                        isActive
                          ? "text-emerald-600"
                          : "text-gray-500 group-hover:text-gray-700",
                      )}
                    />
                    {!collapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                    {collapsed && (
                      <span className="absolute left-14 hidden whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Collapse toggle button */}
        <div className="p-4 border-t border-gray-200/80 bg-white/30 backdrop-blur-sm hidden lg:flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
