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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Join ADP Today</h1>
            <p className="text-emerald-100 text-lg">
              Association of Dietetics Professionals
            </p>
            <p className="text-emerald-50 text-sm mt-3">
              Complete your membership registration in just 4 simple steps
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <FormStepper steps={steps} currentStep={currentStep} />

            <div className="mt-12">
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
                  // onChange={setFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 2 && (
                <StepPayment
                  data={formData}
                  selectedPlan={selectedPlan}
                  // onChange={(data) => setFormData({ ...formData})}
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
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            Have questions?{" "}
            <Link
              href="/contact"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
