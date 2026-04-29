"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, HeartHandshake, LayoutDashboard, Settings, Award, LogOut } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const { logout, user, hasPermission } = useAuth();
  const pathname = usePathname();
  const hasAdminRole = user?.roleId === UpdateRoleDtoRole.admin || user?.roleId === UpdateRoleDtoRole.superAdmin;
  const canUseAdminWorkspace = hasAdminRole && hasPermission(adminDashboardPermission);
  const dashboardHref = canUseAdminWorkspace ? "/admin" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getRoleBadgeColor = (role: string | null | undefined) => {
    switch (role) {
      case "admin":        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "premium":      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      case "professional": return "bg-herb-100 text-herb-800 dark:bg-herb-900/40 dark:text-herb-300";
      case "student":      return "bg-herb-100 text-herb-700 dark:bg-herb-900/40 dark:text-herb-300";
      default:             return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/98 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-background/95 backdrop-blur-sm border-b border-border"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/ADP.svg"
                alt="Association of Dietetics Professionals logo"
                width={32}
                height={32}
                className="object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <span className="hidden sm:inline font-semibold text-sm text-foreground tracking-tight leading-tight max-w-[200px] lg:max-w-none line-clamp-1">
              Association of Dietetics Professionals
            </span>
          </Link>

          {/* Desktop Nav — centered */}
          <nav className="hidden lg:flex items-center gap-0.5 mx-4">
            {publicNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            {/* Donate — desktop */}
            <Button
              size="sm"
              variant="ghost"
              aria-label="Donate"
              onClick={() => setDonateOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full text-primary hover:bg-secondary text-sm font-medium px-3"
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Donate</span>
            </Button>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground rounded-full px-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="hidden sm:inline text-sm">{user.name}</span>
                    <Badge className={`text-xs ${getRoleBadgeColor(user?.role)}`}>
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border shadow-lg rounded-xl">
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
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-foreground rounded-full px-4"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-5 shadow-sm"
                >
                  <Link href="/membership/join">Join Now</Link>
                </Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-muted-foreground hover:text-foreground rounded-full"
                  aria-label="Open menu"
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-80 bg-background border-l border-border p-0">
                <div className="flex flex-col h-full">
                  {/* Sheet header */}
                  <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 border-b border-border">
                    <Image src="/ADP.svg" alt="ADP" width={28} height={28} />
                    <span className="font-semibold text-sm text-foreground">ADP</span>
                  </div>

                  <div className="flex-1 flex flex-col px-4 py-4 space-y-1 overflow-y-auto">
                    {canUseAdminWorkspace ? (
                      <div className="mb-2">
                        <DashboardSwitcher compact showLabel={false} />
                      </div>
                    ) : null}

                    {publicNavigation.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`text-sm font-medium px-4 py-3 rounded-xl transition-all duration-150 ${
                            active
                              ? "text-foreground bg-secondary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Sheet footer */}
                  <div className="px-4 py-4 border-t border-border space-y-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-border text-primary gap-2"
                      onClick={() => { setIsOpen(false); setDonateOpen(true); }}
                    >
                      <HeartHandshake className="h-4 w-4" />
                      Donate
                    </Button>
                    {!user && (
                      <>
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full rounded-full text-muted-foreground"
                        >
                          <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Link href="/membership/join" onClick={() => setIsOpen(false)}>
                            Join Now
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <DonateQRCodeDialog open={donateOpen} onOpenChange={setDonateOpen} />
    </header>
  );
}

export default Header;
