import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useMembershipStore } from "@/store/useMembershipStore";
import { useEffect, useRef } from "react";

type DateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_3_months"
  | "last_6_months"
  | "last_1_year";

interface UserMembershipFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string | undefined;
  setStatusFilter: (value: string | undefined) => void;
  planFilter: string | undefined;
  setPlanFilter: (value: string | undefined) => void;
  dateFilter: DateFilter | undefined;
  setDateFilter: (value: DateFilter | undefined) => void;
  clearFilters: () => void;
}

export default function UserMembershipFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  planFilter,
  setPlanFilter,
  dateFilter,
  setDateFilter,
  clearFilters,
}: UserMembershipFiltersProps) {
  const { memberships, fetchMemberships } = useMembershipStore();
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchMemberships().catch(() => {
      didFetchRef.current = false;
    });
  }, [fetchMemberships]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Name, email, or plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(val) =>
            setStatusFilter(val === "all" ? undefined : val)
          }
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="0">Active</SelectItem>
            <SelectItem value="1">Expired</SelectItem>
            <SelectItem value="2">Pending</SelectItem>
            <SelectItem value="3">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Membership Plan Filter */}
      <div className="space-y-2">
        <Label htmlFor="plan">Membership Plan</Label>
        <Select
          value={planFilter ?? "all"}
          onValueChange={(val) =>
            setPlanFilter(val === "all" ? undefined : val)
          }
        >
          <SelectTrigger id="plan">
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {memberships.map((plan) => (
              <SelectItem key={plan.id} value={plan.id!}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label htmlFor="date">Date Range</Label>
        <Select
          value={dateFilter ?? "all"}
          onValueChange={(val) =>
            setDateFilter(val === "all" ? undefined : (val as DateFilter))
          }
        >
          <SelectTrigger id="date">
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="last_1_year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      <div className="flex items-end md:col-span-2 lg:col-span-4">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full md:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
