"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { User, Save, Loader2, MessageSquareQuote, Star, Upload, Trash2 } from "lucide-react";
import { CertificateDisplay } from "@/components/certificates/CertificateDisplay";
import { useCertificateStore } from "@/store/useCertificateStore";
import { useTestimonialStore } from "@/store/useTestimonialStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/services/api-client";
import { refreshCurrentUserSession } from "@/lib/auth-session";

type MediaUploadResponse = {
  url: string;
  fileName: string;
  folder: string;
  size: number;
  contentType: string;
  uploadedAt: string;
};

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const hasLoadedCertificatesRef = useRef(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const { certificates, fetchMyCertificates, loading, error } =
    useCertificateStore();
  const {
    myTestimonials,
    fetchMyTestimonials,
    loading: testimonialsLoading,
  } = useTestimonialStore();

  useEffect(() => {
    void fetchMyTestimonials().catch(() => undefined);
  }, [fetchMyTestimonials]);

  useEffect(() => {
    if (activeTab !== "certificates" || hasLoadedCertificatesRef.current) {
      return;
    }

    hasLoadedCertificatesRef.current = true;
    void fetchMyCertificates().catch(() => {
      hasLoadedCertificatesRef.current = false;
    });
  }, [activeTab, fetchMyCertificates]);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    // email: user?.email || "",
    avatar: user?.avatar || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
    specializations: user?.specializations?.join(", ") || "",
    bio: user?.bio || "",
  });

  useEffect(() => {
    setProfileData({
      name: user?.name || "",
      avatar: user?.avatar || "",
      phone: user?.phone || "",
      organization: user?.organization || "",
      specializations: user?.specializations?.join(", ") || "",
      bio: user?.bio || "",
    });
  }, [user?.avatar, user?.bio, user?.name, user?.organization, user?.phone, user?.specializations]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await apiClient({
        url: "/api/users/profile",
        method: "PUT",
        data: {
          name: profileData.name.trim(),
          avatar: profileData.avatar,
          phone: profileData.phone.trim(),
          organization: profileData.organization.trim(),
          bio: profileData.bio.trim(),
          specializations: profileData.specializations
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        },
      });

      await refreshCurrentUserSession();
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Profile update failed",
        description: error instanceof Error ? error.message : "Unable to update your profile.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient<MediaUploadResponse>({
        url: "/api/media/upload",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfileData((prev) => ({
        ...prev,
        avatar: response.data.url,
      }));

      toast({
        title: "Profile picture uploaded",
        description: "Save your profile to use this picture across the site and testimonials.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload your profile picture.",
        variant: "error",
      });
    } finally {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setIsUploadingAvatar(false);
    }
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "professional":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "student":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="membership">Membership</TabsTrigger>
        <TabsTrigger value="certificates">Certificates</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>
              Update your personal details and professional information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border border-slate-200">
                  <AvatarImage src={profileData.avatar || undefined} alt={profileData.name || user?.name || "Profile photo"} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-semibold">
                    {(profileData.name || user?.name || "U")
                      .split(" ")
                      .map((value) => value[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">Profile picture</p>
                  <p className="text-sm text-slate-500">
                    This image is reused on your member testimonial when you submit one.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload photo
                    </>
                  )}
                </Button>
                {profileData.avatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setProfileData((prev) => ({ ...prev, avatar: "" }))}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div> */}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profileData.organization}
                  onChange={(e) =>
                    handleInputChange("organization", e.target.value)
                  }
                  placeholder="Your workplace or institution"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                id="specializations"
                value={profileData.specializations}
                onChange={(e) =>
                  handleInputChange("specializations", e.target.value)
                }
                placeholder="e.g., Clinical Nutrition, Sports Nutrition, Pediatric"
              />
              <p className="text-sm text-slate-500">
                Separate multiple specializations with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about your professional background and interests..."
                rows={4}
              />
            </div>

            <Button onClick={handleSave} disabled={isLoading || isUploadingAvatar}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="membership" className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Membership Details</CardTitle>
            <CardDescription>
              View your current membership status and billing information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Membership Tier
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getRoleBadgeColor(user?.role?.toLocaleLowerCase() || "")} variant="outline">
                      {user?.membership?.tier}
                    </Badge>
                    <Badge
                      className={getMembershipStatusColor(
                        user?.membership?.status?.toLowerCase() || ""
                      )}
                      variant="outline"
                    >
                      {user?.membership?.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Member Since
                  </Label>
                  <p className="text-slate-900 mt-1">
                    {user?.membership?.joinDate}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Next Renewal
                  </Label>
                  <p className="text-slate-900 mt-1">
                    {user?.membership?.expirationDate}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Member ID
                  </Label>
                  <p className="text-slate-900 mt-1 font-mono">{user?.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Role
                  </Label>
                  <Badge className={getRoleBadgeColor(user?.role || "")} variant="outline">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* <div className="flex gap-4">
              <Button variant="outline">Download Certificate</Button>
              <Button>Renew Membership</Button>
            </div> */}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="certificates" className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Certificates</CardTitle>
            <CardDescription>
              View and download your earned certificates and achievements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600">Loading certificates...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Failed to load certificates. Please try again later.</p>
              </div>
            ) : (
              <CertificateDisplay certificates={certificates} />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="testimonials" className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5" />
              My Testimonials
            </CardTitle>
            <CardDescription>
              Track the review status of testimonials you have submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testimonialsLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading testimonials...
              </div>
            ) : myTestimonials.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No testimonials submitted yet. You can submit one from your dashboard.
              </div>
            ) : (
              <div className="space-y-4">
                {myTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                      <p className="text-xs text-slate-500">
                        Submitted {new Date(testimonial.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{testimonial.content}</p>
                    {testimonial.rejectionReason ? (
                      <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                        <span className="font-medium">Review note:</span> {testimonial.rejectionReason}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
