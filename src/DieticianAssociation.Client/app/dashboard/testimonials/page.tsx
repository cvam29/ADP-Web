"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquareQuote, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTestimonialStore } from "@/store/useTestimonialStore";

const initialForm = {
  content: "",
  professionalTitle: "",
  photoUrl: "",
  rating: 5,
  consentToPublish: false,
};

export default function DashboardTestimonialsPage() {
  const { user } = useAuth();
  const {
    myTestimonials,
    fetchMyTestimonials,
    submitTestimonial,
    submitting,
    loading,
  } = useTestimonialStore();

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    void fetchMyTestimonials().catch(() => undefined);
  }, [fetchMyTestimonials]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitTestimonial({
      content: form.content,
      professionalTitle: form.professionalTitle,
      photoUrl: form.photoUrl || undefined,
      rating: form.rating,
      consentToPublish: form.consentToPublish,
    });
    setForm(initialForm);
    await fetchMyTestimonials();
  };

  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.dashboard.access"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Member Testimonials</h1>
              <p className="mt-1 text-sm text-gray-600">
                Submit a testimonial for admin review and track its publication status.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/profile">View profile history</Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-emerald-600" />
                  Submit a Testimonial
                </CardTitle>
                <CardDescription>
                  Tell prospective members how the association has helped your practice or career.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="professionalTitle">Professional title or specialization</Label>
                    <Input
                      id="professionalTitle"
                      placeholder="Clinical Nutritionist"
                      value={form.professionalTitle}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          professionalTitle: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Your testimonial</Label>
                    <Textarea
                      id="content"
                      rows={6}
                      minLength={30}
                      maxLength={3000}
                      placeholder="Describe the impact the association has had on your work, learning, or professional network."
                      value={form.content}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          content: event.target.value,
                        }))
                      }
                      required
                    />
                    <p className="text-xs text-slate-500">Minimum 30 characters. Clear, specific submissions review faster.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Select
                        value={String(form.rating)}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            rating: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <SelectItem key={rating} value={String(rating)}>
                              {rating} star{rating > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">Profile picture</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Your testimonial will use your current profile picture automatically.
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {user?.avatar ? "Profile picture on file." : "No profile picture saved yet. Add one from your profile page."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                    <Checkbox
                      id="consentToPublish"
                      checked={form.consentToPublish}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          consentToPublish: checked === true,
                        }))
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consentToPublish">I consent to this testimonial being published publicly if approved.</Label>
                      <p className="text-xs text-slate-500">
                        Approved testimonials may appear on membership and marketing pages.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for review"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>My recent submissions</CardTitle>
                <CardDescription>Review statuses update after an admin decision.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading submissions...
                  </div>
                ) : myTestimonials.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                    No testimonials submitted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTestimonials.slice(0, 5).map((testimonial) => (
                      <div key={testimonial.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">{testimonial.professionalTitle}</p>
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
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-amber-500">
                              {[...Array(testimonial.rating)].map((_, index) => (
                                <Star key={index} className="h-4 w-4 fill-current" />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(testimonial.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 line-clamp-4">{testimonial.content}</p>
                        {testimonial.rejectionReason ? (
                          <p className="mt-3 text-sm text-red-700">Review note: {testimonial.rejectionReason}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}