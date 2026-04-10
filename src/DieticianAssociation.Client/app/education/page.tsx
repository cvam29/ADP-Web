"use client";

import { useEffect, useState } from "react";
import { useEducationStore } from "@/store/useEducationStore";
import { useGeoStore } from "@/store/useGeoStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  GraduationCap,
  ExternalLink,
  Star,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TAB_CONFIG = [
  { value: 1, key: "ug-courses", label: "UG Courses" },
  { value: 2, key: "pg-courses", label: "PG Courses" },
  { value: 4, key: "phd-programs", label: "PhD Programs" },
  { value: 8, key: "diploma-courses", label: "Diploma Courses" },
  { value: 16, key: "certification-courses", label: "Certification Courses" },
  { value: 32, key: "fellowship-programs", label: "Fellowship Programs" },
];

const DEFAULT_COUNTRY_NAME = "india";

const normalizeExternalUrl = (url?: string | null) => {
  if (!url) {
    return undefined;
  }

  return url.startsWith("http") ? url : `https://${url}`;
};

const resolveDefaultCountryId = (
  countries: Array<{ id?: number; name?: string | null }>,
) => {
  const india = countries.find(
    (country) => country.name?.trim().toLowerCase() === DEFAULT_COUNTRY_NAME,
  );

  return india?.id ?? countries[0]?.id ?? null;
};

export function EducationPage() {
  const {
    universities,
    fetchUniversities,
    fetchDistrictsByState,
    fetchAcademicsPaginated,
    academicsData,
    loading,
    districts,
    collegeTypes,
    fetchCollegeTypes,
  } = useEducationStore();

  const { countries, states, fetchCountries, fetchStatesByCountry } =
    useGeoStore();

  const [activeTab, setActiveTab] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  // University type filter (string, matches CollegeTypeDto.name)
  const [selectedUniversityType, setSelectedUniversityType] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const initializeFilters = async () => {
      fetchUniversities();
      fetchCollegeTypes();

      const loadedCountries = await fetchCountries();
      const defaultCountryId = resolveDefaultCountryId(loadedCountries);

      if (cancelled || !defaultCountryId) {
        return;
      }

      setSelectedCountry(defaultCountryId);
      await fetchStatesByCountry(defaultCountryId);
    };

    initializeFilters().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [fetchUniversities, fetchCountries, fetchStatesByCountry, fetchCollegeTypes]);

  useEffect(() => {
    // Build filters object for paginated API
    const filters: Record<string, unknown> = {};
    if (selectedUniversityType && selectedUniversityType.trim() !== "") {
      filters.institutionTypeCategory = selectedUniversityType;
    }

    fetchAcademicsPaginated({
      page,
      pageSize: 10,
      selectedTab: activeTab as any,
      search: searchQuery || undefined,
      stateId: selectedState ?? undefined,
      districtId: selectedDistrict ?? undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      includeInstitutions: true,
      includeColleges: true,
      sortBy: "name",
      sortDirection: "asc",
    });
  }, [
    activeTab,
    page,
    searchQuery,
    selectedState,
    selectedDistrict,
    selectedUniversityType,
    fetchAcademicsPaginated,
  ]);

  useEffect(() => {
    if (selectedState) {
      fetchDistrictsByState(selectedState);
      return;
    }

    setSelectedDistrict(null);
  }, [selectedState, fetchDistrictsByState]);

  const handleCountryChange = (countryId: number) => {
    setSelectedCountry(countryId);
    setSelectedState(null);
    setSelectedDistrict(null);
    fetchStatesByCountry(countryId);
  };

  const handleStateChange = (stateId: number) => {
    setSelectedState(stateId);
    setSelectedDistrict(null);
    fetchDistrictsByState(stateId);
  };

  const clearFilters = () => {
    setPage(1);
    setSearchQuery("");
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedUniversityType(undefined);
  };

  const entries = academicsData?.results?.items ?? [];
  const pageInfo = academicsData?.results;

  // Derive university types from fetched universities (unique, non-empty)
  const universityTypes = Array.from(
    new Set(
      (universities || [])
        .map((u: any) => (typeof u.universityType === "string" ? u.universityType.trim() : ""))
        .filter((v: string) => v.length > 0),
    ),
  );

  const hasActiveFilters =
    searchQuery ||
    selectedState ||
    selectedDistrict ||
    selectedUniversityType;

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-secondary/30 py-16 px-4">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Directory
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Academic Resources</h1>
            <p className="text-base text-muted-foreground mt-2">
              Explore institutions, colleges, and programs in one education directory.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search institutions, colleges, or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <Tabs
          value={TAB_CONFIG.find((t) => t.value === activeTab)?.key}
          onValueChange={(value) => {
            const selected = TAB_CONFIG.find((t) => t.key === value);
            if (selected) {
              setActiveTab(selected.value);
              setPage(1);
            }
          }}
          className="w-full"
        >
          <div className="mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide md:overflow-visible md:px-0 md:pb-0">
            <TabsList className="grid h-auto min-w-max grid-flow-col auto-cols-[minmax(150px,1fr)] gap-1 rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm md:min-w-0 md:grid-flow-row md:grid-cols-6">
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="whitespace-nowrap rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-500 transition-all hover:text-gray-900 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm md:min-w-0"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {TAB_CONFIG.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-5">
                <div className="lg:col-span-1">
                  <Card className="sticky top-20">
                    <CardContent className="space-y-4 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter className="h-5 w-5 text-gray-600" />
                          <h2 className="text-lg font-semibold">Filters</h2>
                        </div>
                        {hasActiveFilters && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Clear
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select
                          value={selectedCountry?.toString()}
                          onValueChange={(value) =>
                            handleCountryChange(parseInt(value))
                          }
                          disabled={true}
                        >
                          <SelectTrigger className="bg-gray-50 text-gray-500 cursor-not-allowed">
                            <SelectValue placeholder="All countries" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem
                                key={country.id}
                                value={country.id?.toString() || ""}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select
                          value={selectedState?.toString()}
                          onValueChange={(value) =>
                            handleStateChange(parseInt(value))
                          }
                          disabled={!selectedCountry}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All states" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem
                                key={state.id}
                                value={state.id?.toString() || ""}
                              >
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>District</Label>
                        <Select
                          value={selectedDistrict?.toString()}
                          onValueChange={(value) =>
                            setSelectedDistrict(parseInt(value))
                          }
                          disabled={!selectedState}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All districts" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem
                                key={district.id}
                                value={district.id.toString()}
                              >
                                {district.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>University Type</Label>
                        <Select
                          value={selectedUniversityType ?? "__all"}
                          onValueChange={(value) =>
                            setSelectedUniversityType(value === "__all" ? undefined : value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all">All types</SelectItem>
                            {universityTypes.map((type: string) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6 lg:col-span-3 xl:col-span-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Showing <span className="font-semibold text-slate-900">{entries.length}</span> of{" "}
                      <span className="font-semibold text-slate-900">{pageInfo?.totalItems ?? 0}</span> results
                    </p>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="overflow-hidden rounded-xl">
                          <CardContent className="p-4 md:p-5">
                            <div className="flex flex-col gap-4 md:grid md:grid-cols-[88px_minmax(0,1fr)_150px] md:items-center">
                              <div className="h-20 w-20 animate-pulse rounded-2xl bg-gray-100" />
                              <div className="space-y-3">
                                <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                                <div className="flex gap-2">
                                  <div className="h-6 w-28 animate-pulse rounded-full bg-gray-100" />
                                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                                </div>
                              </div>
                              <div className="space-y-3 md:ml-auto md:w-[150px]">
                                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-100" />
                                <div className="ml-auto h-9 w-28 animate-pulse rounded-md bg-gray-200" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : entries.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          No results found
                        </h3>
                        <p className="mb-4 text-gray-600">
                          Try adjusting your filters or search query
                        </p>
                        {hasActiveFilters && (
                          <Button onClick={clearFilters} variant="outline">
                            Clear all filters
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                        <Table>
                          <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-slate-50/80">
                              <TableHead className="w-[28%]">Institution</TableHead>
                              <TableHead className="w-[20%]">Type</TableHead>
                              <TableHead className="w-[16%]">University</TableHead>
                              <TableHead className="w-[20%]">Location</TableHead>
                              <TableHead className="w-[8%]">Rating</TableHead>
                              <TableHead className="w-[8%] text-right">Website</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entries.map((item) => {
                              const isCollege = item.entityType === 2;
                              const location = [item.districtName, item.stateName]
                                .filter(Boolean)
                                .join(", ");
                              const websiteUrl = normalizeExternalUrl(item.websiteUrl);

                              return (
                                <TableRow
                                  key={`${item.entityType}-${item.entityId}`}
                                  className="bg-white transition-colors hover:bg-emerald-50/40"
                                >
                                  <TableCell className="align-top">
                                    <div className="flex items-start gap-3">
                                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                        isCollege
                                          ? "bg-blue-50 text-blue-600"
                                          : "bg-emerald-50 text-emerald-600"
                                      }`}>
                                        {isCollege ? (
                                          <GraduationCap className="h-5 w-5" />
                                        ) : (
                                          <Building2 className="h-5 w-5" />
                                        )}
                                      </div>
                                      <div className="min-w-0 space-y-1">
                                        <p className="line-clamp-2 font-semibold text-slate-900">
                                          {item.name}
                                        </p>
                                        {item.code && (
                                          <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Code: {item.code}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top">
                                    {item.institutionTypeCategory ? (
                                      <Badge
                                        variant="outline"
                                        className="h-6 whitespace-nowrap rounded-full border-emerald-200 px-2.5 py-0 text-[11px] font-medium leading-none text-emerald-700"
                                      >
                                        {item.institutionTypeCategory}
                                      </Badge>
                                    ) : isCollege ? (
                                      <Badge className="h-6 whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-0 text-[11px] font-medium leading-none text-white hover:bg-slate-900">
                                        College
                                      </Badge>
                                    ) : null}
                                  </TableCell>
                                  <TableCell>
                                    <p className="line-clamp-2 text-sm text-slate-600">
                                      {item.universityName || "Independent institution"}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    {location ? (
                                      <div className="flex items-start gap-1.5 text-sm text-slate-600">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        <span className="line-clamp-2">{location}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-slate-400">Location unavailable</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                          <Star
                                            key={value}
                                            className={`h-3.5 w-3.5 ${
                                              (item.rating ?? 0) >= value
                                                ? "fill-amber-400 text-amber-400"
                                                : "fill-gray-200 text-gray-200"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <p className="text-xs text-slate-500">
                                        {(item.rating ?? 0) > 0
                                          ? `${item.rating}/5`
                                          : "Not rated"}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {websiteUrl ? (
                                      <Button asChild size="sm" className="min-w-24">
                                        <a
                                          href={websiteUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Visit
                                        </a>
                                      </Button>
                                    ) : (
                                      <span className="text-sm text-slate-400">N/A</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="space-y-4 md:hidden">
                        {entries.map((item) => {
                          const isCollege = item.entityType === 2;
                          const gradient = isCollege
                            ? "from-blue-100 to-indigo-50"
                            : "from-emerald-100 to-teal-50";
                          const iconColor = isCollege
                            ? "text-blue-500"
                            : "text-emerald-600";
                          const ItemIcon = isCollege ? GraduationCap : Building2;
                          const websiteUrl = normalizeExternalUrl(item.websiteUrl);
                          const location = [item.districtName, item.stateName]
                            .filter(Boolean)
                            .join(", ");

                          return (
                            <Card
                              key={`${item.entityType}-${item.entityId}`}
                              className="group overflow-hidden rounded-xl border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                            >
                              <CardContent className="p-0">
                                <div className="flex flex-col gap-4 p-4">
                                  <div className="flex items-start gap-4">
                                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-sm`}>
                                      <ItemIcon className={`h-8 w-8 ${iconColor}`} />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                      {item.institutionTypeCategory && (
                                        <div className="flex flex-wrap items-center gap-2">
                                          <Badge
                                            variant="outline"
                                            className="border-emerald-200 text-emerald-700"
                                          >
                                            {item.institutionTypeCategory}
                                          </Badge>
                                        </div>
                                      )}
                                      <div className="space-y-1.5">
                                        <h3 className="text-base font-semibold text-slate-900">
                                          {item.name}
                                        </h3>
                                        {item.code && (
                                          <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Code: {item.code}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3">
                                    <div>
                                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        University
                                      </p>
                                      <p className="mt-1 text-sm text-slate-700">
                                        {item.universityName || "Independent institution"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Location
                                      </p>
                                      <p className="mt-1 text-sm text-slate-700">
                                        {location || "Location unavailable"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Rating
                                      </p>
                                      <div className="mt-1 flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((value) => (
                                            <Star
                                              key={value}
                                              className={`h-3.5 w-3.5 ${
                                                (item.rating ?? 0) >= value
                                                  ? "fill-amber-400 text-amber-400"
                                                  : "fill-gray-200 text-gray-200"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-xs text-slate-500">
                                          {(item.rating ?? 0) > 0
                                            ? `${item.rating}/5`
                                            : "Not rated"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {websiteUrl && (
                                    <Button asChild size="sm" className="w-full">
                                      <a
                                        href={websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Visit Website <ExternalLink className="ml-1 h-3.5 w-3.5" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pageInfo?.hasPrevious}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Badge variant="outline">Page {pageInfo?.page ?? page}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pageInfo?.hasNext}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default EducationPage;
