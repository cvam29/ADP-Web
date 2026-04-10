"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import DashboardSwitcher from "@/components/dashboard-switcher";
import PageLoading from "@/components/page-loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Calendar,
  Award,
  BarChart3,
  CreditCard,
  Plus,
  Eye,
  Download,
  Clock,
  Star,
  Settings,
  GraduationCap,
  Wallet,
} from "lucide-react";
import {
  UpdateRoleDtoRole,
  UserMembershipDtoPaymentStatus,
  UserMembershipDtoStatus,
  type MembershipPlanDto as MembershipPlan,
  type UserMembershipDto,
} from "@/services/generated";
import { useEventsStore } from "@/store/useEventsStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useMembershipStore } from "@/store/useMembershipStore";
import { useResourcesStore } from "@/store/useResourcesStore";
import { formatCurrency } from "@/lib/currency";

type ActivityItem = {
  key: string
  title: string
  description: string
  timestamp: Date
  color: string
}

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatRelativeTime = (value: Date): string => {
  const diffMs = value.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);
  return formatter.format(diffMonths, "month");
};

const getMembershipRevenueAmount = (
  membership: UserMembershipDto,
  plan?: MembershipPlan,
): number => {
  if (!plan) return 0;

  const isRenewal = !!membership.renewedAt;
  const candidates = isRenewal
    ? [
        plan.renewalPriceWithGST,
        plan.discountedRenewalFee,
        plan.renewalFee,
        plan.priceWithGST,
        plan.discountedPrice,
        plan.initialFee,
        plan.price,
      ]
    : [
        plan.priceWithGST,
        plan.discountedPrice,
        plan.initialFee,
        plan.price,
      ];

  const amount = candidates.find(
    (candidate): candidate is number => typeof candidate === "number" && Number.isFinite(candidate),
  );

  return amount ?? 0;
};

export default function AdminDashboard() {
  const { user, loading, hasAnyRole, hasPermission } = useAuth();
  const {
    stats,
    fetchStats,
    loading: statsLoading,
  } = useAdminStore();
  const {
    memberships,
    fetchMemberships,
    userMemberships,
    fetchUserMemberships,
    loading: membershipsLoading,
  } = useMembershipStore();
  const { events, fetchEvents, loading: eventsLoading } = useEventsStore();
  const {
    resources,
    fetchResources,
    loading: resourcesLoading,
  } = useResourcesStore();

  const dataFetchedRef = useRef(false);
  useEffect(() => {
    if (dataFetchedRef.current) return;
    if (!loading && hasAnyRole([UpdateRoleDtoRole.admin, UpdateRoleDtoRole.superAdmin]) && hasPermission("admin.dashboard.view")) {
      dataFetchedRef.current = true;
      fetchStats().catch(() => {
        dataFetchedRef.current = false;
      });
      fetchMemberships().catch(() => {
        dataFetchedRef.current = false;
      });
      fetchUserMemberships({
        page: 1,
        pageSize: 100,
        sortBy: "updatedAt",
        sortDirection: "desc",
      }).catch(() => {
        dataFetchedRef.current = false;
      });
      if (!events || events.length === 0) {
        fetchEvents({ page: 1, pageSize: 50 }).catch(() => {
          dataFetchedRef.current = false;
        });
      }
      if (!resources || resources.length === 0) {
        fetchResources({ page: 1, pageSize: 50 }).catch(() => {
          dataFetchedRef.current = false;
        });
      }
    }
  }, [loading, hasAnyRole, hasPermission, fetchEvents, fetchResources, fetchStats, fetchMemberships, fetchUserMemberships, events, resources]);

  const recentPlans = useMemo(() => {
    return [...(memberships || [])]
      .sort((a, b) => {
        if (!!a.popular !== !!b.popular) return a.popular ? -1 : 1;
        return (a.name ?? "").localeCompare(b.name ?? "");
      })
      .slice(0, 4);
  }, [memberships]);

  const eventInsights = useMemo(() => {
    const list = events || [];
    const totalEvents = list.length;
    const upcoming = list.filter(
      (e) => e.date && new Date(e.date) > new Date(),
    ).length;
    const totalRegistrations = list.reduce((sum, e) => {
      const reg =
        typeof (e as any).registered === "number"
          ? (e as any).registered
          : parseInt(String((e as any).registered ?? "0"), 10);
      return sum + (Number.isFinite(reg) ? reg : 0);
    }, 0);
    return { totalEvents, upcoming, totalRegistrations };
  }, [events]);

  const membershipInsights = useMemo(() => {
    const planById = new Map((memberships || []).map((plan) => [plan.id, plan]));
    const list = userMemberships || [];
    const verifiedMemberships = list.filter(
      (membership) => membership.paymentStatus === UserMembershipDtoPaymentStatus.NUMBER_1,
    );
    const activeMemberships = list.filter(
      (membership) => membership.status === UserMembershipDtoStatus.active,
    );
    const pendingMemberships = list.filter(
      (membership) => membership.status === UserMembershipDtoStatus.pending,
    );
    const verifiedRevenue = verifiedMemberships.reduce((sum, membership) => {
      const plan = membership.membershipPlanId ? planById.get(membership.membershipPlanId) : undefined;
      return sum + getMembershipRevenueAmount(membership, plan);
    }, 0);

    return {
      totalMemberships: list.length,
      activeMemberships: activeMemberships.length,
      pendingMemberships: pendingMemberships.length,
      verifiedRevenue,
    };
  }, [memberships, userMemberships]);

  const resourceInsights = useMemo(() => {
    const list = resources || [];
    return {
      totalResources: list.length,
      totalDownloads: list.reduce((sum, r) => sum + (r.downloads || 0), 0),
      premiumResources: list.filter((r) => !!r.premium).length,
      categories: new Set(list.map((r) => r.category).filter(Boolean)).size,
    };
  }, [resources]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const membershipActivity = (userMemberships || []).flatMap((membership) => {
      const createdAt = parseDate(membership.createdAt);
      const updatedAt = parseDate(membership.updatedAt);
      const items: ActivityItem[] = [];
      const memberName = membership.userName || membership.userEmail || "Member";
      const planName = membership.membershipPlanName || "membership";

      if (createdAt) {
        items.push({
          key: `membership-created-${membership.id}`,
          title: "Membership application submitted",
          description: `${memberName} applied for ${planName}`,
          timestamp: createdAt,
          color: "bg-emerald-500",
        });
      }

      if (
        updatedAt &&
        membership.status === UserMembershipDtoStatus.active &&
        (!createdAt || updatedAt.getTime() !== createdAt.getTime())
      ) {
        items.push({
          key: `membership-active-${membership.id}`,
          title: "Membership activated",
          description: `${memberName} is now active on ${planName}`,
          timestamp: updatedAt,
          color: "bg-sky-500",
        });
      }

      if (
        updatedAt &&
        membership.paymentStatus === UserMembershipDtoPaymentStatus.NUMBER_1 &&
        (!createdAt || updatedAt.getTime() !== createdAt.getTime())
      ) {
        items.push({
          key: `membership-payment-${membership.id}`,
          title: "Membership payment verified",
          description: `${memberName}'s payment for ${planName} was verified`,
          timestamp: updatedAt,
          color: "bg-amber-500",
        });
      }

      return items;
    });

    const eventActivity = (events || []).flatMap((event) => {
      const updatedAt = parseDate(event.updatedAt);
      const createdAt = parseDate(event.createdAt);
      const timestamp = updatedAt || createdAt;
      if (!timestamp) return [];

      return [{
        key: `event-${event.id}`,
        title: updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime() ? "Event updated" : "Event published",
        description: event.title || "Untitled event",
        timestamp,
        color: "bg-blue-500",
      }];
    });

    const resourceActivity = (resources || []).flatMap((resource) => {
      const timestamp = parseDate(resource.date);
      if (!timestamp) return [];

      return [{
        key: `resource-${resource.id}`,
        title: "Resource published",
        description: resource.title || "Untitled resource",
        timestamp,
        color: "bg-purple-500",
      }];
    });

    return [...membershipActivity, ...eventActivity, ...resourceActivity]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 6);
  }, [events, resources, userMemberships]);

  const insightsCards = [
    {
      group: "Users",
      title: "Total Users",
      value: String(stats?.totalUsers ?? 0),
      icon: Users,
      color: "bg-sky-500",
    },
    {
      group: "Users",
      title: "Active Memberships",
      value: String(membershipInsights.activeMemberships || stats?.activeUsers || 0),
      icon: CreditCard,
      color: "bg-emerald-500",
    },
    {
      group: "Users",
      title: "Expired Memberships",
      value: String(stats?.expiredUsers ?? 0),
      icon: Award,
      color: "bg-rose-500",
    },
    {
      group: "Membership",
      title: "Membership Plans",
      value: String(memberships?.length ?? 0),
      icon: Settings,
      color: "bg-orange-500",
    },
    {
      group: "Events",
      title: "Total Events",
      value: String(stats?.totalEvents ?? eventInsights.totalEvents),
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      group: "Events",
      title: "Upcoming Events",
      value: String(stats?.upcomingEvents ?? eventInsights.upcoming),
      icon: Clock,
      color: "bg-indigo-500",
    },
    {
      group: "Events",
      title: "Total Registrations",
      value: eventInsights.totalRegistrations.toString(),
      icon: Users,
      color: "bg-green-500",
    },
    {
      group: "Events",
      title: "Verified Revenue",
      value: formatCurrency(membershipInsights.verifiedRevenue),
      icon: Wallet,
      color: "bg-yellow-500",
    },
    {
      group: "Membership",
      title: "Pending Memberships",
      value: String(membershipInsights.pendingMemberships),
      icon: Star,
      color: "bg-amber-500",
    },
    {
      group: "Resources",
      title: "Total Resources",
      value: resourceInsights.totalResources.toString(),
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      group: "Resources",
      title: "Total Downloads",
      value: resourceInsights.totalDownloads.toString(),
      icon: Download,
      color: "bg-emerald-500",
    },
    {
      group: "Resources",
      title: "Premium Resources",
      value: resourceInsights.premiumResources.toString(),
      icon: Award,
      color: "bg-pink-500",
    },
    {
      group: "Resources",
      title: "Categories",
      value: resourceInsights.categories.toString(),
      icon: BarChart3,
      color: "bg-teal-500",
    },
  ];

  const overallLoading = loading || statsLoading || membershipsLoading || eventsLoading || resourcesLoading;
  if (overallLoading) {
    return <PageLoading />;
  }
  if (!user || !hasAnyRole([UpdateRoleDtoRole.admin, UpdateRoleDtoRole.superAdmin]) || !hasPermission("admin.dashboard.view")) return null;

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <DashboardSwitcher />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user.name}. Here’s an overview of your platform.
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">Administrator</Badge>
      </div>

      {/* Insights */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Platform Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {insightsCards.map((card) => (
            <Card
              key={card.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${card.color}`}>
                  <card.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Membership Section */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Membership Management
            </CardTitle>
            <CardDescription>Manage plans & users efficiently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <Link href="/admin/membership" className="sm:flex-1">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" /> Plans
                </Button>
              </Link>
              <Link href="/admin/users" className="sm:flex-1">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" /> Users
                </Button>
              </Link>
              <Link href="/admin/education" className="sm:flex-1">
                <Button variant="outline" className="w-full justify-start">
                  <GraduationCap className="w-4 h-4 mr-2" /> Education
                </Button>
              </Link>
              <Link href="/admin/membership" className="sm:flex-1">
                <Button className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" /> New Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent Membership Plans
            </CardTitle>
            <CardDescription>
              Latest membership plans in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPlans.length > 0 ? (
              <div className="space-y-3">
                {recentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan.name}</p>
                        {plan.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        ₹{plan.price} • {plan.duration} months
                      </p>
                    </div>
                    <Link href="/admin/membership">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                <Link href="/admin/membership">
                  <Button variant="outline" className="w-full mt-2">
                    View All Plans
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">No membership plans found</p>
                <Link href="/admin/membership">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> Create First Plan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest platform activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.key}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No recent platform activity available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
