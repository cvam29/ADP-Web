"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMembershipStore } from "@/store/useMembershipStore";
import { formatCurrency } from "@/lib/currency";
import { Upload, FileText, X } from "lucide-react";
import { ADPSpinner } from "@/components/ui/adp-spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const GST_RATE = 0.18;

interface MembershipDetailsData {
  membershipPlanId: string;
  educationDetails: Array<{
    title: string;
    level: string;
    course: string;
    university: string;
    status: string;
    marks: string;
    degreeFile: File | null;
  }>;
}

interface StepMembershipDetailsProps {
  data: MembershipDetailsData;
  onChange: (data: MembershipDetailsData) => void;
  onBack: () => void;
  onNext: () => void;
}

const EDUCATION_STATUS_OPTIONS = [
  { label: "Pursuing", value: "0" },
  { label: "Completed", value: "1" },
];

export function StepMembershipDetails({
  data,
  onChange,
  onBack,
  onNext,
}: StepMembershipDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    memberships: plans,
    loading,
    error,
    fetchMemberships,
  } = useMembershipStore();

  useEffect(() => {
    // Load membership plans via store on mount
    fetchMemberships();
  }, [fetchMemberships]);

  // Helper functions
  const getTierName = (tier?: number) => {
    switch (tier) {
      case 0:
        return "Student";
      case 1:
        return "Professional";
      case 2:
        return "Premium";
      default:
        return "Member";
    }
  };

  const getTierDescription = (tier?: number) => {
    switch (tier) {
      case 0:
        return "Perfect for nutrition students and recent graduates";
      case 1:
        return "Comprehensive membership for practicing dieticians";
      case 2:
        return "Premium membership with exclusive benefits";
      default:
        return "Professional membership for dieticians";
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration || duration <= 0) return "duration";
    // Assume duration in months; convert to years and cap long terms as lifetime
    if (duration > 60) return "Lifetime";
    const years = duration / 12;
    if (years >= 1) {
      const wholeYears = Number.isInteger(years) ? years : +years.toFixed(1);
      return `${wholeYears} year${wholeYears === 1 ? "" : "s"}`;
    }
    return "<1 year";
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!data.membershipPlanId)
      newErrors.membershipPlanId = "Please select a membership type";

    // Validate Education Details
    data.educationDetails.forEach((edu, index) => {
      // If any field is filled, or if it's the first standard entry ("Under Graduate" / "Post Graduate"), we might want to enforce it.
      // Since the frontend previously had default entries without validating them, we will validate entries that have at least one field filled,
      // or if it's the primary degree. We will just enforce that ALL fields must be filled for any entry that exists.
      
      const isEmpty = !edu.course && !edu.university && !edu.status && !edu.marks && !edu.degreeFile;
      
      if (!isEmpty || index === 0) {
        if (!edu.course) newErrors[`edu_${index}_course`] = "Course is required";
        if (!edu.university) newErrors[`edu_${index}_university`] = "University is required";
        if (!edu.status) newErrors[`edu_${index}_status`] = "Status is required";
        if (!edu.marks) newErrors[`edu_${index}_marks`] = "Marks are required";
        if (!edu.degreeFile) newErrors[`edu_${index}_degreeFile`] = "Degree certificate is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const handleMembershipChange = (type: string) => {
    onChange({ ...data, membershipPlanId: type });
    if (errors.membershipPlanId) {
      setErrors({ ...errors, membershipPlanId: "" });
    }
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...data.educationDetails];
    if (!updated[index]) {
      updated[index] = {
        title: "",
        level: "",
        course: "",
        university: "",
        status: "",
        marks: "",
        degreeFile: null,
      };
    }
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, educationDetails: updated });
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...data.educationDetails];
    if (updated[index]) {
      updated[index] = { ...updated[index], degreeFile: file };
      onChange({ ...data, educationDetails: updated });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Select Your Membership
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the membership plan that best fits your needs
          </p>
        </div>
        <div className="flex justify-center py-12">
          <ADPSpinner size="md" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Select Your Membership
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the membership plan that best fits your needs
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchMemberships()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Sort plans by tier
  const sortedPlans = [...(plans ?? [])].sort(
    (a, b) => (a.tier ?? 99) - (b.tier ?? 99),
  );
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          Select Your Membership
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the membership plan that best fits your needs
        </p>
      </div>

      {/* Membership Selection */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-2">
              1
            </span>
            Choose Your Plan <span className="text-destructive">*</span>
          </h4>
          <RadioGroup
            value={data.membershipPlanId}
            onValueChange={handleMembershipChange}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedPlans.map((plan) => {
                const price = plan.price ?? 0;
                const priceWithGST = +(
                  plan.priceWithGST ?? price * (1 + GST_RATE)
                ).toFixed(2);

                return (
                  <div
                    key={plan.id ?? Math.random().toString(36)}
                    className="relative"
                  >
                    <div
                      className={`
                        p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${
                          data.membershipPlanId === plan.id?.toString()
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={plan.id?.toString() ?? ""}
                          id={plan.id?.toString() ?? ""}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={plan.id?.toString() ?? ""}
                            className="text-sm font-semibold text-foreground cursor-pointer block"
                          >
                            {plan.name ?? "Membership"}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTierDescription(plan.tier)}
                          </p>
                          <p className="text-2xl font-bold text-primary mt-3">
                            {formatCurrency(price)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            + GST: {formatCurrency(priceWithGST)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(plan.duration ?? undefined)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
          {errors.membershipPlanId && (
            <p className="text-destructive text-xs mt-2">
              {errors.membershipPlanId}
            </p>
          )}
        </div>

        {/* Membership Comparison Table */}
        {sortedPlans.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-2">
                2
              </span>
              Membership Comparison
            </h4>
            <div className="overflow-x-auto border border-border rounded-xl">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="bg-secondary/40 border-b border-border">
                    <TableHead className="font-semibold text-foreground">
                      Feature
                    </TableHead>
                    {sortedPlans.map((plan) => (
                      <TableHead
                        key={plan.id}
                        className="text-center font-semibold text-foreground"
                      >
                        {getTierName(plan.tier)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-card">
                    <TableCell className="font-medium text-foreground w-40">
                      Membership Fee (Inc. GST)
                    </TableCell>
                    {sortedPlans.map((plan) => {
                      const price = plan.price ?? 0;
                      const priceWithGST = +(
                        plan.priceWithGST ?? price
                      ).toFixed(2);

                      return (
                        <TableCell key={plan.id} className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-primary font-bold text-sm">
                              {formatCurrency(priceWithGST)}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              Base: {formatCurrency(price)}
                            </span>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-medium text-foreground w-40">
                      Validity
                    </TableCell>
                    {sortedPlans.map((plan) => (
                      <TableCell
                        key={plan.id}
                        className="text-center text-muted-foreground"
                      >
                        {formatDuration(plan.duration ?? undefined)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {sortedPlans.some(
                    (p) => p.features && p.features.length > 0,
                  ) && (
                    <TableRow className="bg-card">
                      <TableCell className="font-medium text-foreground w-40">
                        Key Features
                      </TableCell>
                      {sortedPlans.map((plan) => (
                        <TableCell
                          key={plan.id}
                          className="text-center text-muted-foreground"
                        >
                          <ul className="text-xs space-y-1">
                            {(plan.features ?? [])
                              .slice(0, 3)
                              .map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                          </ul>
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Educational Qualifications */}
      <div className="bg-secondary/40 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-2">
            3
          </span>
          Educational Qualifications
        </h4>
        <div className="space-y-4">
          {data.educationDetails.map((edu, idx) => (
            <div
              key={idx}
              className="p-4 bg-card border border-border rounded-lg space-y-3"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-foreground">
                  {edu.title}
                </p>
                {data.educationDetails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = data.educationDetails.filter(
                        (_, i) => i !== idx,
                      );
                      onChange({ ...data, educationDetails: updated });
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 h-7 text-xs"
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor={`course-${idx}`}
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Course / Stream
                  </Label>
                  <Input
                    id={`course-${idx}`}
                    placeholder="e.g., BSc Nutrition"
                    value={edu.course || ""}
                    onChange={(e) =>
                      handleEducationChange(idx, "course", e.target.value)
                    }
                    className={`text-sm ${errors[`edu_${idx}_course`] ? "border-destructive" : ""}`}
                  />
                  {errors[`edu_${idx}_course`] && (
                    <p className="text-destructive text-xs mt-1">
                      {errors[`edu_${idx}_course`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor={`university-${idx}`}
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    University / Board *
                  </Label>
                  <Input
                    id={`university-${idx}`}
                    placeholder="University name"
                    value={edu.university || ""}
                    onChange={(e) =>
                      handleEducationChange(idx, "university", e.target.value)
                    }
                    className={`text-sm ${errors[`edu_${idx}_university`] ? "border-destructive" : ""}`}
                  />
                  {errors[`edu_${idx}_university`] && (
                    <p className="text-destructive text-xs mt-1">
                      {errors[`edu_${idx}_university`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor={`status-${idx}`}
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Status *
                  </Label>

                  <Select
                    value={edu.status || ""}
                    onValueChange={(value) =>
                      handleEducationChange(idx, "status", value)
                    }
                  >
                    <SelectTrigger
                      className={`text-sm ${errors[`edu_${idx}_status`] ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      {EDUCATION_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`edu_${idx}_status`] && (
                    <p className="text-destructive text-xs mt-1">
                      {errors[`edu_${idx}_status`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor={`marks-${idx}`}
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Marks % / CGPA *
                  </Label>
                  <Input
                    id={`marks-${idx}`}
                    placeholder="Score"
                    value={edu.marks || ""}
                    onChange={(e) =>
                      handleEducationChange(idx, "marks", e.target.value)
                    }
                    className={`text-sm ${errors[`edu_${idx}_marks`] ? "border-destructive" : ""}`}
                  />
                  {errors[`edu_${idx}_marks`] && (
                    <p className="text-destructive text-xs mt-1">
                      {errors[`edu_${idx}_marks`]}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label
                    htmlFor={`degree-file-${idx}`}
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Degree Certificate *
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`degree-file-${idx}`}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            // Validate file size (10MB max)
                            if (file.size > 10 * 1024 * 1024) {
                              alert("File size must be less than 10MB");
                              e.target.value = "";
                              return;
                            }
                            // Validate file type
                            const validTypes = [
                              "image/jpeg",
                              "image/png",
                              "image/gif",
                              "image/webp",
                              "application/pdf",
                            ];
                            if (!validTypes.includes(file.type)) {
                              alert(
                                "Please upload an image (JPEG, PNG, GIF, WebP) or PDF file",
                              );
                              e.target.value = "";
                              return;
                            }
                          }
                          handleFileChange(idx, file);
                        }}
                        className={`hidden ${
                          errors[`edu_${idx}_degreeFile`] ? "border-red-500" : ""
                        }`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById(`degree-file-${idx}`)?.click()
                        }
                        className={`w-full text-xs ${
                          errors[`edu_${idx}_degreeFile`]
                            ? "border-destructive text-destructive"
                            : ""
                        }`}
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        {edu.degreeFile ? "Change File" : "Upload File"}
                      </Button>
                    </div>
                    {edu.degreeFile && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-md text-xs">
                        <FileText className="w-3 h-3 text-primary" />
                        <span className="text-primary max-w-[150px] truncate">
                          {edu.degreeFile.name}
                        </span>
                        <span className="text-primary/80">
                          ({(edu.degreeFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleFileChange(idx, null);
                            const input = document.getElementById(
                              `degree-file-${idx}`,
                            ) as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                          className="text-primary hover:text-primary/70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a photo or PDF of your degree (Max 10MB)
                  </p>
                  {errors[`edu_${idx}_degreeFile`] && (
                    <p className="text-destructive text-xs mt-1">
                      {errors[`edu_${idx}_degreeFile`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newEducation = {
                title: "Other",
                level: "99",
                course: "",
                university: "",
                status: "",
                marks: "",
                degreeFile: null,
              };
              onChange({
                ...data,
                educationDetails: [...data.educationDetails, newEducation],
              });
            }}
            className="w-full font-medium"
          >
            + Add Qualification
          </Button>
        </div>
      </div>

      {/* Other Qualifications */}
      {/* <div className="bg-gray-50 rounded-xl p-6">
        <Label htmlFor="other-qual" className="text-sm font-semibold text-gray-900 block mb-3">
          Other Qualifications (Optional)
        </Label>
        <Textarea
          id="other-qual"
          placeholder="List any other relevant qualifications or certifications..."
          value={data.otherQualifications}
          onChange={(e) => onChange({ ...data, otherQualifications: e.target.value })}
          className="min-h-24 focus:ring-emerald-500"
        />
      </div> */}

      {/* Action Buttons */}
      <div className="flex justify-between gap-3 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 bg-transparent"
        >
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          className="px-8 font-semibold"
        >
          Continue to Payment →
        </Button>
      </div>
    </div>
  );
}
