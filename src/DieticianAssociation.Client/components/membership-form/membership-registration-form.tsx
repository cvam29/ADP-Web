"use client";

import { useState, type ComponentProps } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { FormStepper } from "./form-stepper";
import { StepPersonalInfo } from "./step-personal-info";
import { StepMembershipDetails } from "./step-membership-details";
import { StepPayment } from "./step-payment";
import { StepDeclaration } from "./step-declaration";
import { useToast } from "@/hooks/use-toast";

type PersonalInfoData = ComponentProps<typeof StepPersonalInfo>["data"];
type MembershipDetailsData = ComponentProps<typeof StepMembershipDetails>["data"];
type PaymentData = ComponentProps<typeof StepPayment>["data"];
type DeclarationData = ComponentProps<typeof StepDeclaration>["data"];

interface MembershipFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  "Personal Information",
  "Membership Details",
  "Payment Information",
  "Declaration & Consent",
];

export function MembershipRegistrationForm({
  open,
  onOpenChange,
}: MembershipFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
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
  });

  const [membershipDetails, setMembershipDetails] = useState<MembershipDetailsData>({
    membershipPlanId: "",
    educationDetails: [
      {
        title: "Bachelor's / UG",
        level: "Bachelor's / UG",
        course: "",
        university: "",
        status: "",
        marks: "",
        degreeFile: null,
      },
      {
        title: "Master's / PG Diploma",
        level: "Master's / PG Diploma",
        course: "",
        university: "",
        status: "",
        marks: "",
        degreeFile: null,
      },
      {
        title: "PhD or Higher",
        level: "PhD or Higher",
        course: "",
        university: "",
        status: "",
        marks: "",
        degreeFile: null,
      },
    ],
  });

  const [payment, setPayment] = useState<PaymentData>({
    receiptFile: null,
  });

  const [declaration, setDeclaration] = useState<DeclarationData>({
    agreeRules: false,
    agreeDeclaration: false,
    captcha: "",
    captchaCode: "745874578",
  });

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically send the form data to your backend
      const formData = new FormData();
      formData.append("personalInfo", JSON.stringify(personalInfo));
      formData.append("membershipDetails", JSON.stringify(membershipDetails));
      formData.append("declaration", JSON.stringify(declaration));
      if (payment.receiptFile) {
        formData.append("receipt", payment.receiptFile);
      }

      // Simulate API call
      console.log("Form submitted:", {
        personalInfo,
        membershipDetails,
        payment,
        declaration,
      });

      toast({
        title: "Success!",
        description:
          "Your membership application has been submitted. Please check your email for confirmation.",
      });

      onOpenChange(false);
      // Reset form
      setCurrentStep(0);
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-0 rounded-2xl">
        {/* Header Section */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8 rounded-t-2xl">
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
                data={personalInfo}
                onChange={setPersonalInfo}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 1 && (
              <StepMembershipDetails
                data={membershipDetails}
                onChange={setMembershipDetails}
                onBack={handlePreviousStep}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 2 && (
              <StepPayment
                data={payment}
                onChange={setPayment}
                onBack={handlePreviousStep}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 3 && (
              <StepDeclaration
                data={declaration}
                onChange={setDeclaration}
                onBack={handlePreviousStep}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
