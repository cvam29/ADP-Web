"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

type DateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_3_months"
  | "last_6_months"
  | "last_1_year";

interface UserFiltersProps {
  search: string;
  setSearch: (val: string) => void;

  roleFilter?: string;
  setRoleFilter: (val: string | undefined) => void;

  statusFilter?: boolean;
  setStatusFilter: (val: boolean | undefined) => void;

  dateFilter?: DateFilter;
  setDateFilter: (val: DateFilter | undefined) => void;

  clearFilters: () => void;
}

export default function UserFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  clearFilters,
}: UserFiltersProps) {
  const hasActiveFilters =
    !!search ||
    !!roleFilter ||
    statusFilter !== undefined ||
    (dateFilter && dateFilter !== "all");

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Filter className="h-4 w-4 text-primary" />
        Filters
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Role */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Admin</SelectItem>
            <SelectItem value="0">Student</SelectItem>
            <SelectItem value="3">Member</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={statusFilter !== undefined ? String(statusFilter) : undefined}
          onValueChange={(val) =>
            setStatusFilter(val === "true" ? true : false)
          }
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Select
          value={dateFilter}
          onValueChange={(val) =>
            setDateFilter(val === "all" ? undefined : (val as DateFilter))
          }
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="last_1_year">Last 1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters + Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Filters applied
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
