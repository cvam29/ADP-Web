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
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
          collapsed ? "lg:w-16" : "lg:w-64",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:block",
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Admin info */}
        {user && !collapsed && (
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex items-center space-x-3">
              <Avatar className="w-9 h-9 ring-2 ring-zinc-100 dark:ring-zinc-800">
                <AvatarImage
                  src={user.avatar || "/admin-placeholder.avif"}
                  alt={user.name ?? ""}
                />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                  {(user?.name ?? "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user.name}
                </p>
                <Badge
                  className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 text-xs mt-1 flex items-center w-fit"
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
        <nav className="flex-1 min-h-0 p-3 space-y-5 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {/* Admin Section */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-2">
                Administration
              </h3>
            )}
            <div className="space-y-0.5">
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
                          "w-full group relative flex items-center rounded-lg text-sm font-medium transition-colors duration-150",
                          collapsed
                            ? "justify-center px-3 py-2.5"
                            : "px-3 py-2.5 space-x-2.5",
                          isActive || isChildActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-l-2 border-zinc-900 dark:border-zinc-100"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isActive || isChildActive
                              ? "text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300",
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.name}</span>
                            <ChevronDown
                              className={cn(
                                "w-3.5 h-3.5 text-zinc-400 transition-transform duration-200",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </>
                        )}
                        {collapsed && (
                          <span className="absolute left-14 hidden whitespace-nowrap rounded-lg bg-zinc-900 dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-100 shadow-lg group-hover:block z-50">
                            {item.name}
                          </span>
                        )}
                      </button>
                      {!collapsed && (
                        <div
                          className={cn(
                            "ml-4 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-3 overflow-hidden transition-all duration-200",
                            isExpanded
                              ? "max-h-96 mt-0.5 opacity-100"
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
                                  "group relative flex items-center rounded-lg text-sm font-medium transition-colors duration-150 px-2.5 py-2 space-x-2",
                                  isChildItemActive
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100",
                                )}
                              >
                                <child.icon
                                  className={cn(
                                    "w-3.5 h-3.5 flex-shrink-0",
                                    isChildItemActive
                                      ? "text-zinc-900 dark:text-zinc-100"
                                      : "text-zinc-400 dark:text-zinc-500",
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
                      "group relative flex items-center rounded-lg text-sm font-medium transition-colors duration-150",
                      collapsed
                        ? "justify-center px-3 py-2.5"
                        : "px-3 py-2.5 space-x-2.5",
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-l-2 border-zinc-900 dark:border-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300",
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                    {collapsed && (
                      <span className="absolute left-14 hidden whitespace-nowrap rounded-lg bg-zinc-900 dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-100 shadow-lg group-hover:block z-50">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Workspace Section */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-2">
                Workspace
              </h3>
            )}
            <div className="space-y-0.5">
              {userNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center rounded-lg text-sm font-medium transition-colors duration-150",
                      collapsed
                        ? "justify-center px-3 py-2.5"
                        : "px-3 py-2.5 space-x-2.5",
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-600"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300",
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                    {collapsed && (
                      <span className="absolute left-14 hidden whitespace-nowrap rounded-lg bg-zinc-900 dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-100 shadow-lg group-hover:block z-50">
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
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 hidden lg:flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
