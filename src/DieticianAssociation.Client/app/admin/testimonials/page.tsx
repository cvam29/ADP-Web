"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { UpdateRoleDtoRole } from "@/services/generated";
import { useTestimonialStore } from "@/store/useTestimonialStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Loader2, Star, Trash2 } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonialDto } from "@/types/testimonials";

export default function AdminTestimonialsPage() {
  const { hasPermission } = useAuth();
  const {
    adminTestimonials,
    adminPagedResult,
    loading,
    reviewing,
    deleting,
    fetchAdminTestimonials,
    reviewTestimonial,
    deleteTestimonial,
  } = useTestimonialStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [featureSelections, setFeatureSelections] = useState<Record<string, boolean>>({});
  const [previewTestimonial, setPreviewTestimonial] = useState<TestimonialDto | null>(null);
  const canDeleteTestimonials = hasPermission("testimonials.delete");

  const debouncedSearch = useDebounce(search, 400);

  const params = useMemo(() => {
    const filters: Record<string, unknown> = {};
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }

    return {
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: "submittedAt",
      sortDirection: "desc",
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [debouncedSearch, page, pageSize, statusFilter]);

  useEffect(() => {
    void fetchAdminTestimonials(params).catch(() => undefined);
  }, [fetchAdminTestimonials, params]);

  const handleApprove = async (id: string) => {
    await reviewTestimonial(id, {
      status: "Approved",
      isFeatured: featureSelections[id] ?? false,
    });
  };

  const handleReject = async () => {
    if (!selectedId) {
      return;
    }

    await reviewTestimonial(selectedId, {
      status: "Rejected",
      rejectionReason,
      isFeatured: false,
    });
    setSelectedId(null);
    setRejectionReason("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this testimonial permanently? This action cannot be undone.")) {
      return;
    }

    await deleteTestimonial(id);
  };

  return (
    <ProtectedRoute
      requiredRoles={[UpdateRoleDtoRole.admin, UpdateRoleDtoRole.superAdmin]}
      requiredPermissions={["testimonials.read"]}
    >
      <div className="w-full px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Testimonials</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review, approve, reject, and feature member-submitted testimonials.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search the moderation queue and narrow by status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <Input
                placeholder="Search by member, title, or content"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="max-w-md"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Moderation queue</CardTitle>
            <CardDescription>
              {adminPagedResult?.totalItems ?? adminTestimonials.length} total submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                        <div className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading testimonials...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : adminTestimonials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                        No testimonials found
                      </TableCell>
                    </TableRow>
                  ) : (
                    adminTestimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{testimonial.memberName}</p>
                            <p className="text-xs text-slate-500">{testimonial.submittedBy?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{testimonial.professionalTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(testimonial.rating)].map((_, index) => (
                              <Star key={index} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              testimonial.status === "Approved"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : testimonial.status === "Rejected"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                            }
                          >
                            {testimonial.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={featureSelections[testimonial.id] ?? testimonial.isFeatured}
                              onCheckedChange={(checked) =>
                                setFeatureSelections((current) => ({
                                  ...current,
                                  [testimonial.id]: checked === true,
                                }))
                              }
                            />
                            <span className="text-xs text-slate-500">Feature</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(testimonial.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-sm">
                          <p className="line-clamp-3 text-sm text-slate-600">{testimonial.content}</p>
                          {testimonial.rejectionReason ? (
                            <p className="mt-2 text-xs text-red-700">Reason: {testimonial.rejectionReason}</p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewTestimonial(testimonial)}
                              disabled={reviewing || deleting}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => void handleApprove(testimonial.id)}
                              disabled={reviewing || deleting || testimonial.status === "Approved"}
                            >
                              {testimonial.status === "Approved" ? "Approved" : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedId(testimonial.id);
                                setRejectionReason(testimonial.rejectionReason ?? "");
                              }}
                              disabled={reviewing || deleting}
                            >
                              Reject
                            </Button>
                            {canDeleteTestimonials ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => void handleDelete(testimonial.id)}
                                disabled={reviewing || deleting}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                Page {adminPagedResult?.page ?? page} of {adminPagedResult?.totalPages ?? 1}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={(adminPagedResult?.hasPrevious ?? page > 1) === false}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((current) => current + 1)} disabled={(adminPagedResult?.hasNext ?? false) === false}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={selectedId !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject testimonial</DialogTitle>
              <DialogDescription>
                Provide a short reason so the member understands what needs to change.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection reason</Label>
              <Textarea
                id="rejectionReason"
                rows={4}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain why this testimonial was not approved."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Cancel
              </Button>
              <Button onClick={() => void handleReject()} disabled={reviewing || deleting || !rejectionReason.trim()}>
                {reviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={previewTestimonial !== null}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewTestimonial(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Testimonial preview</DialogTitle>
              <DialogDescription>Review the full submission before moderating.</DialogDescription>
            </DialogHeader>

            {previewTestimonial ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={previewTestimonial.photoUrl || previewTestimonial.submittedBy?.avatar || undefined}
                        alt={previewTestimonial.memberName || "Member photo"}
                      />
                      <AvatarFallback>
                        {(previewTestimonial.memberName || "M")
                          .split(" ")
                          .map((value) => value[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">{previewTestimonial.memberName}</p>
                      <p className="text-sm text-slate-500">{previewTestimonial.professionalTitle}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      previewTestimonial.status === "Approved"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : previewTestimonial.status === "Rejected"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {previewTestimonial.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>Submitted {new Date(previewTestimonial.submittedAt).toLocaleDateString()}</span>
                  <span>Featured: {previewTestimonial.isFeatured ? "Yes" : "No"}</span>
                  <span>Consent to publish: {previewTestimonial.consentToPublish ? "Yes" : "No"}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(previewTestimonial.rating)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {previewTestimonial.content}
                  </p>
                </div>

                {previewTestimonial.rejectionReason ? (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                    Rejection reason: {previewTestimonial.rejectionReason}
                  </div>
                ) : null}
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewTestimonial(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}