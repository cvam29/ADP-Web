"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, User, HeartHandshake, LayoutDashboard, Settings, Award, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DonateQRCodeDialog } from "@/components/donate-qr-dialog";
import { DashboardSwitcher } from "@/components/dashboard-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { adminDashboardPermission } from "@/lib/member-access";
import { publicNavigation } from "../lib/site-navigation";
import { UpdateRoleDtoRole } from "@/services/generated";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const { logout, user, hasPermission } = useAuth();
  const pathname = usePathname();
  const hasAdminRole = user?.roleId === UpdateRoleDtoRole.admin || user?.roleId === UpdateRoleDtoRole.superAdmin;
  const canUseAdminWorkspace = hasAdminRole && hasPermission(adminDashboardPermission);
  const dashboardHref = canUseAdminWorkspace
    ? "/admin"
    : "/dashboard";

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getRoleBadgeColor = (role: string | null | undefined) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "professional":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Donate button */}
          <div className="flex items-center gap-3 mr-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image
                  src="/ADP.svg"
                  alt="Association of Dietetics Professionals logo"
                  width={32}
                  height={32}
                  className="object-cover rounded-lg"
                />
              </div>
              <span className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1 tracking-tight">
                Association of Dietetics Professionals
              </span>
            </Link>

            {/* Donate button */}
            <Button
              size="sm"
              variant="outline"
              aria-label="Donate"
              title="Donate"
              onClick={() => setDonateOpen(true)}
              className="group ml-1 hidden md:inline-flex items-center gap-2 rounded-full border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 transition-colors duration-150"
            >
              <HeartHandshake className="h-4 w-4" />
              <span className="font-medium">Donate</span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {publicNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    active
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme Toggle + User Menu or Auth Buttons + Mobile Menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{user.name}</span>
                    <Badge
                      className={`text-xs ${getRoleBadgeColor(user?.role)}`}
                    >
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-zinc-200 dark:border-zinc-800">
                  <DropdownMenuSeparator />
                  {canUseAdminWorkspace ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          Member Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href={dashboardHref} className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/certificates" className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certificates
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden lg:flex items-center gap-2 ml-2">
                <Button asChild variant="ghost" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-5">
                  <Link href="/membership/join">Join Now</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-600 dark:text-zinc-400">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-80 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col space-y-1 mt-8">
                  {canUseAdminWorkspace ? <DashboardSwitcher compact showLabel={false} /> : null}

                  {/* Donate on mobile */}
                  <Button
                    aria-label="Donate"
                    onClick={() => {
                      setIsOpen(false);
                      setDonateOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 mb-3"
                  >
                    <HeartHandshake className="h-4 w-4" />
                    <span>Donate</span>
                  </Button>

                  {publicNavigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                          active
                            ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  {!user && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <Button asChild variant="ghost" className="text-zinc-700 dark:text-zinc-300">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Link href="/membership/join">Join Now</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Donate QR Dialog */}
      <DonateQRCodeDialog open={donateOpen} onOpenChange={setDonateOpen} />
    </header>
  );
}

export default Header;
