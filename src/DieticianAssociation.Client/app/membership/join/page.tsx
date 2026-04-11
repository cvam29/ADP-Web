"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FormStepper } from "@/components/membership-form/form-stepper";
import { StepPersonalInfo } from "@/components/membership-form/step-personal-info";
import { StepMembershipDetails } from "@/components/membership-form/step-membership-details";
import { StepPayment } from "@/components/membership-form/step-payment";
import { StepDeclaration } from "@/components/membership-form/step-declaration";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMembershipStore } from "@/store/useMembershipStore";

export default function MembershipJoinPage() {
  const router = useRouter();
  const { memberships, registerMembership, checkEmailAvailability } =
    useMembershipStore();
  const [currentStep, setCurrentStep] = useState(0);
  const normalizeDialCode = (value: string) => {
    const trimmedValue = value.trim();
    const numericDialCode = trimmedValue.replace(/\D/g, "");

    if (!numericDialCode) {
      return "+91";
    }

    return `+${numericDialCode}`;
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    email: "",
    countryCode: "+91",
    phone: "",
    streetAddress: "",
    addressLine2: "",
    postalCode: "",
    countryId: undefined as number | undefined,
    stateId: undefined as number | undefined,
    cityId: undefined as number | undefined,
    membershipPlanId: "",
    educationDetails: [
      {
        title: "Under Graduate",
        level: "0",
        course: "",
        university: "",
        status: "",
        marks: "",
        degreeFile: null as File | null,
      },
      {
        title: "Post Graduate",
        level: "1",
        course: "",
        university: "",
        status: "",
        marks: "",
        degreeFile: null as File | null,
      },
      {
        title: "Doctorate",
        level: "2",
        course: "",
        university: "",
        status: "",
        marks: "",
        degreeFile: null as File | null,
      },
    ],
    receiptFile: null as File | null,
    agreeTerms: false,
    agreePrivacy: false,
    agreeDataUsage: false,
    certifyTrue: false,
    captchaInput: "",
    captchaCode: "",
  });

  const steps = [
    "Personal Information",
    "Membership Details",
    "Payment",
    "Declaration & Consent",
  ];

  const selectedPlan = memberships.find(
    (plan) => plan.id === formData.membershipPlanId,
  );

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    const normalizedDialCode = normalizeDialCode(formData.countryCode);
    const normalizedPhoneNumber = formData.phone.replace(/\D/g, "");

    // Transform formData to match backend DTO expectations
    const apiPayload = {
      PersonalInfo: JSON.stringify({
        FirstName: formData.firstName,
        LastName: formData.lastName,
        DateOfBirth: formData.dateOfBirth,
        Gender: formData.gender,
        Nationality: Number(formData.nationality),
        Email: formData.email,
        Phone: `${normalizedDialCode}${normalizedPhoneNumber}`,
        StreetAddress: formData.streetAddress,
        AddressLine2: formData.addressLine2,
        CityId: formData.cityId,
        StateId: formData.stateId,
        CountryId: formData.countryId,
        PostalCode: formData.postalCode,
      }),
      MembershipDetails: JSON.stringify({
        MembershipPlanId: formData.membershipPlanId,
        EducationDetails: formData.educationDetails.map((edu) => ({
          Level: Number(edu.level),
          Course: edu.course,
          University: edu.university,
          Status: Number(edu.status),
          Marks: edu.marks,
        })),
      }),
      Declaration: JSON.stringify({
        AgreeDeclaration: formData.certifyTrue,
        AgreeTerms: formData.agreeTerms,
        AgreePrivacy: formData.agreePrivacy,
        AgreeDataUsage: formData.agreeDataUsage,
      }),
      Receipt: formData.receiptFile || undefined,
      EducationFiles: formData.educationDetails
        .map((edu) => edu.degreeFile)
        .filter((file): file is File => file !== null),
    };

    const result = await registerMembership(apiPayload);
    if (!result) {
      return;
    }

    const searchParams = new URLSearchParams({
      email: result.email ?? formData.email,
      applicationRequestId:
        result.applicationRequestId ?? result.membershipId ?? "",
      userId: result.userId ?? "",
      status: "pending",
      confirmationSent: result.confirmationSent ? "true" : "false",
      message:
        result.message ??
        "Membership application submitted successfully. We will contact you after review.",
    });

    router.push(`/membership/confirmation?${searchParams.toString()}`);
  };

  const validateUniqueEmail = useCallback(
    async (email: string): Promise<boolean> => {
      const normalizedEmail = email.trim();
      if (!normalizedEmail) {
        return true;
      }

      return checkEmailAvailability(normalizedEmail);
    },
    [checkEmailAvailability],
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Page header bar */}
      <div className="border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/membership"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Membership
          </Link>
          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Page title */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Registration</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Join ADP Today</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Complete your membership registration in {steps.length} simple steps
          </p>
        </div>

        {/* Stepper */}
        <FormStepper steps={steps} currentStep={currentStep} />

        {/* Form card */}
        <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
          {/* Step label strip */}
          <div className="border-b border-border bg-secondary/40 px-8 py-4">
            <h2 className="text-sm font-semibold text-foreground">{steps[currentStep]}</h2>
          </div>

          <div className="p-8">
            {currentStep === 0 && (
              <StepPersonalInfo
                data={{
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  dateOfBirth: formData.dateOfBirth,
                  gender: formData.gender,
                  nationality: formData.nationality,
                  email: formData.email,
                  countryCode: formData.countryCode,
                  phone: formData.phone,
                  streetAddress: formData.streetAddress,
                  addressLine2: formData.addressLine2,
                  postalCode: formData.postalCode,
                  countryId: formData.countryId,
                  stateId: formData.stateId,
                  cityId: formData.cityId,
                }}
                onChange={(data) => setFormData({ ...formData, ...data })}
                onValidateUniqueEmail={validateUniqueEmail}
                onNext={handleNext}
              />
            )}

            {currentStep === 1 && (
              <StepMembershipDetails
                data={formData}
                onChange={(data) => setFormData({ ...formData, ...data })}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 2 && (
              <StepPayment
                data={formData}
                selectedPlan={selectedPlan}
                onChange={(data) => setFormData({ ...formData, ...data })}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 3 && (
              <StepDeclaration
                data={{
                  agreeTerms: formData.agreeTerms,
                  agreePrivacy: formData.agreePrivacy,
                  agreeDataUsage: formData.agreeDataUsage,
                  agreeDeclaration: formData.certifyTrue,
                  captcha: formData.captchaInput,
                  captchaCode: formData.captchaCode,
                }}
                onChange={(data) =>
                  setFormData({
                    ...formData,
                    agreeTerms: data.agreeTerms,
                    agreePrivacy: data.agreePrivacy,
                    agreeDataUsage: data.agreeDataUsage,
                    certifyTrue: data.agreeDeclaration,
                    captchaInput: data.captcha,
                    captchaCode: data.captchaCode,
                  })
                }
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have questions?{" "}
          <Link href="/contact" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
