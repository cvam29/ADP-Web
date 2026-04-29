"use client";
import { useEffect, useState } from "react";
import { useMembershipStore } from "@/store/useMembershipStore";
import { useUserStore } from "@/store/useUsersStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import FeedbackMessage from "@/components/feedback-message";
import UserMembershipFilters from "./UserMembershipFilters";
import UserMembershipTable from "./UserMembershipTable";
import Pagination from "./Pagination";
import useDebounce from "@/hooks/use-debounce";

type DateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_3_months"
  | "last_6_months"
  | "last_1_year";

export default function UserMembershipsManagement() {
  const {
    userMemberships,
    userMembershipsPagedResult,
    fetchUserMemberships,
    updateUserMembershipStatus,
    updateUserMembershipPlan,
    deleteUserMembership,
    permanentDeleteUserMembership,
    success,
    message,
    clearMessage,
  } = useMembershipStore();

  const { updatePaymentStatus } = useUserStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [planFilter, setPlanFilter] = useState<string | undefined>();
  const [dateFilter, setDateFilter] = useState<DateFilter | undefined>();

  const debouncedSearch = useDebounce(search);
  const debouncedStatus = useDebounce(statusFilter);
  const debouncedPlan = useDebounce(planFilter);
  const debouncedDate = useDebounce(dateFilter);

  useEffect(() => {
    fetchUserMemberships({
      page,
      pageSize,
      search: debouncedSearch,
      filters: {
        ...(debouncedStatus ? { status: debouncedStatus } : {}),
        ...(debouncedPlan ? { "MembershipPlan.Id": debouncedPlan } : {}),
        ...(debouncedDate && debouncedDate !== "all"
          ? { dateRange: debouncedDate }
          : {}),
      },
    });
  }, [
    page,
    pageSize,
    debouncedSearch,
    debouncedStatus,
    debouncedPlan,
    debouncedDate,
    fetchUserMemberships,
  ]);

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <FeedbackMessage
        message={message ?? undefined}
        success={success}
        onClear={clearMessage}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            User Memberships Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user memberships, their status, and membership plans.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Refine your search by status, plan, or keyword
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserMembershipFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            planFilter={planFilter}
            setPlanFilter={setPlanFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            clearFilters={() => {
              setSearch("");
              setStatusFilter(undefined);
              setPlanFilter(undefined);
              setDateFilter(undefined);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* User Memberships Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>User Memberships</CardTitle>
          <CardDescription>
            List of all user memberships with their details
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="w-full overflow-x-auto">
            <UserMembershipTable
              userMemberships={userMemberships}
              onStatusChange={async (membershipId, newStatus) => {
                await updateUserMembershipStatus(membershipId, newStatus);
                await fetchUserMemberships({
                  page,
                  pageSize,
                  search: debouncedSearch,
                  filters: {
                    ...(debouncedStatus ? { status: debouncedStatus } : {}),
                    ...(debouncedPlan
                      ? { "MembershipPlan.Id": debouncedPlan }
                      : {}),
                    ...(debouncedDate && debouncedDate !== "all"
                      ? { dateRange: debouncedDate }
                      : {}),
                  },
                });
              }}
              onDelete={async (membershipId) => {
                await deleteUserMembership(membershipId);
                await fetchUserMemberships({
                  page,
                  pageSize,
                  search: debouncedSearch,
                  filters: {
                    ...(debouncedStatus ? { status: debouncedStatus } : {}),
                    ...(debouncedPlan
                      ? { "MembershipPlan.Id": debouncedPlan }
                      : {}),
                    ...(debouncedDate && debouncedDate !== "all"
                      ? { dateRange: debouncedDate }
                      : {}),
                  },
                });
              }}
              onPlanChange={async (membershipId, membershipPlanId) => {
                await updateUserMembershipPlan(membershipId, membershipPlanId);
                await fetchUserMemberships({
                  page,
                  pageSize,
                  search: debouncedSearch,
                  filters: {
                    ...(debouncedStatus ? { status: debouncedStatus } : {}),
                    ...(debouncedPlan
                      ? { "MembershipPlan.Id": debouncedPlan }
                      : {}),
                    ...(debouncedDate && debouncedDate !== "all"
                      ? { dateRange: debouncedDate }
                      : {}),
                  },
                });
              }}
              onPermanentDelete={async (membershipId) => {
                await permanentDeleteUserMembership(membershipId);
                await fetchUserMemberships({
                  page,
                  pageSize,
                  search: debouncedSearch,
                  filters: {
                    ...(debouncedStatus ? { status: debouncedStatus } : {}),
                    ...(debouncedPlan
                      ? { "MembershipPlan.Id": debouncedPlan }
                      : {}),
                    ...(debouncedDate && debouncedDate !== "all"
                      ? { dateRange: debouncedDate }
                      : {}),
                  },
                });
              }}
              onPaymentStatusChange={async (paymentRecordId, newStatus) => {
                await updatePaymentStatus(paymentRecordId, newStatus);
                await fetchUserMemberships({
                  page,
                  pageSize,
                  search: debouncedSearch,
                  filters: {
                    ...(debouncedStatus ? { status: debouncedStatus } : {}),
                    ...(debouncedPlan
                      ? { "MembershipPlan.Id": debouncedPlan }
                      : {}),
                    ...(debouncedDate && debouncedDate !== "all"
                      ? { dateRange: debouncedDate }
                      : {}),
                  },
                });
              }}
            />
          </div>

          {/* Pagination */}
          {userMembershipsPagedResult && (
            <div className="mt-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                pagedResult={userMembershipsPagedResult}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
