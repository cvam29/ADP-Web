"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { Search, Users, ChevronLeft, ChevronRight, Building2, CalendarDays, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useMemberDirectoryStore,
  type MemberDirectoryFacet,
  type MemberDirectoryItem,
} from "@/store/useMemberDirectoryStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";

const PAGE_SIZE = 8;

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function MemberDirectory() {
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const {
    members,
    membershipTiers,
    totalCount,
    loading,
    error,
    fetchDirectory,
  } = useMemberDirectoryStore();

  useEffect(() => {
    let active = true;

    const loadDirectory = async () => {
        if (!active) {
          return;
        }

        await fetchDirectory({
          q: deferredSearchQuery || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          filter_membershipTier: selectedTier === "All" ? undefined : selectedTier,
          sortBy,
        });
    };

    loadDirectory();

    return () => {
      active = false;
    };
  }, [deferredSearchQuery, page, selectedTier, sortBy, fetchDirectory]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, selectedTier, sortBy]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const directoryError = error && /404|not found/i.test(error)
    ? "The member directory is not available in the current API environment yet."
    : error;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">Search verified active members across ADP and connect with peers by specialization, organization, and membership tier.</p>
        <div className="hidden sm:flex items-center gap-5 text-sm text-gray-600 flex-shrink-0">
          <span><span className="font-semibold text-gray-900">{totalCount}</span> active members</span>
          <span><span className="font-semibold text-gray-900">{membershipTiers.length}</span> tiers</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Find members</CardTitle>
              <CardDescription>
                Narrow the directory by name, organization, tier, or the newest joiners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="directory-search">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="directory-search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Name, organization, designation"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Membership tier</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All tiers</SelectItem>
                    {membershipTiers.map((tier) => (
                      <SelectItem key={tier.name} value={tier.name}>
                        {tier.name} ({tier.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="name:desc">Name Z-A</SelectItem>
                    <SelectItem value="joindate:desc">Newest members</SelectItem>
                    <SelectItem value="joindate">Longest-standing members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {loading ? (
              <Card className="border-dashed border-emerald-200 bg-emerald-50/40 shadow-none">
                <CardContent className="flex min-h-[320px] items-center justify-center text-sm text-slate-600">
                  Loading active member profiles...
                </CardContent>
              </Card>
            ) : directoryError ? (
              <Card className="border-red-200 bg-red-50 shadow-none">
                <CardContent className="py-12 text-center">
                  <p className="text-sm text-red-700">{directoryError}</p>
                  <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild variant="outline">
                      <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                    {hasPermission("member.tools.access") ? (
                      <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <Link href="/dashboard/tools">Open Professional Tools</Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : members.length === 0 ? (
              <Card className="border-dashed border-slate-200 shadow-none">
                <CardContent className="py-16 text-center">
                  <Users className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-900">No members match these filters</h3>
                  <p className="mt-2 text-sm text-slate-600">Try a broader search term or switch back to all tiers.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {members.map((member) => (
                    <Card key={member.id} className="overflow-hidden border-slate-200 shadow-sm">
                      <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16 border border-emerald-100 bg-emerald-50">
                            <AvatarImage src={member.avatar ?? undefined} alt={member.name} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-800">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                {member.membershipTier}
                              </Badge>
                            </div>
                            {member.designation && (
                              <p className="mt-1 text-sm font-medium text-slate-700">{member.designation}</p>
                            )}
                            {member.organization && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span>{member.organization}</span>
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              <span>Member since {format(new Date(member.joinDate), "dd MMM yyyy")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {member.specializations?.length ? (
                            member.specializations.slice(0, 4).map((specialization) => (
                              <Badge key={specialization} variant="outline" className="border-slate-200 text-slate-700">
                                <Sparkles className="mr-1 h-3 w-3" />
                                {specialization}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">Profile specializations have not been shared yet.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} active members
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
    </div>
  );
}