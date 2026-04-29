"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeclarationData {
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeDataUsage: boolean;
  agreeDeclaration: boolean;
  captcha: string;
  captchaCode: string;
}

interface StepDeclarationProps {
  data: DeclarationData;
  onChange: (data: DeclarationData) => void;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
}

const termsAndConditions = `
TERMS AND CONDITIONS OF MEMBERSHIP
Association of Dietetics Professionals (ADP)

1. MEMBERSHIP ELIGIBILITY
- Members must be qualified nutrition or dietetics professionals
- Educational qualifications must be verified by ADP
- Current and accurate contact information must be maintained

2. MEMBERSHIP RIGHTS AND RESPONSIBILITIES
- Members have the right to access all ADP resources as per their membership tier
- Members must adhere to the Code of Ethics of ADP
- Members are responsible for maintaining confidentiality of credentials

3. CODE OF ETHICS
- Maintain professional conduct at all times
- Provide accurate information about qualifications
- Refrain from misrepresenting credentials
- Contribute positively to the profession

4. MEMBERSHIP FEES AND PAYMENT
- Membership fees are non-refundable except as per ADP policy
- Fees must be paid in full before membership activation
- Late fees may apply for delayed payments

5. TERMINATION OF MEMBERSHIP
- ADP reserves the right to terminate membership for breach of code of ethics
- Members may resign by providing written notice

6. DATA PROTECTION
- Personal data will be processed according to applicable data protection laws
- Data will not be shared with third parties without consent
- Members have the right to access their personal data

7. LIABILITY
- ADP is not responsible for any loss or damage arising from use of services
- Members use all services at their own risk

8. AMENDMENTS
- ADP reserves the right to amend these terms with 30 days notice
`;

export function StepDeclaration({
  data,
  onChange,
  onBack,
  onSubmit,
}: StepDeclarationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Generate random captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onChange({
      ...data,
      captchaCode: code,
      captcha: "",
    });
  };

  // Initialize captcha on mount
  React.useEffect(() => {
    if (!data.captchaCode) {
      generateCaptcha();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!data.agreeTerms)
      newErrors.agreeTerms = "You must accept the membership terms and ethics guidelines";
    if (!data.agreePrivacy)
      newErrors.agreePrivacy = "You must accept the privacy policy";
    if (!data.agreeDataUsage)
      newErrors.agreeDataUsage = "You must consent to data usage for membership processing";
    if (!data.agreeDeclaration)
      newErrors.agreeDeclaration = "You must accept the declaration";
    if (!data.captcha) newErrors.captcha = "Please enter captcha";
    if (data.captcha !== data.captchaCode)
      newErrors.captcha = "Captcha is incorrect";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      setSubmitting(true);
      try {
        await onSubmit();
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          Declaration & Consent
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review and accept the terms before submitting
        </p>
      </div>

      {/* Terms & Conditions Section */}
      <div className="bg-secondary/40 rounded-xl p-6 space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center">
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-2">
            1
          </span>
          Terms & Conditions
        </h4>
        <ScrollArea className="h-48 border border-border rounded-lg p-4 bg-card">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {termsAndConditions}
          </p>
        </ScrollArea>
      </div>

      {/* Agreements Section */}
      <div className="bg-secondary/40 rounded-xl p-6 space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center">
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-2">
            2
          </span>
          Agreements & Declarations
        </h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-background transition">
            <Checkbox
              id="agreeTerms"
              checked={data.agreeTerms}
              onCheckedChange={(checked) =>
                onChange({ ...data, agreeTerms: checked as boolean })
              }
              className="mt-1"
            />
            <Label htmlFor="agreeTerms" className="font-normal cursor-pointer text-foreground text-sm">
              I agree to the ADP membership terms, rules, regulations, and ethics guidelines{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.agreeTerms && (
            <p className="text-sm text-destructive ml-8">{errors.agreeTerms}</p>
          )}

          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-background transition">
            <Checkbox
              id="agreePrivacy"
              checked={data.agreePrivacy}
              onCheckedChange={(checked) =>
                onChange({ ...data, agreePrivacy: checked as boolean })
              }
              className="mt-1"
            />
            <Label htmlFor="agreePrivacy" className="font-normal cursor-pointer text-foreground text-sm">
              I have read and accept the ADP privacy policy for handling my personal information{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.agreePrivacy && (
            <p className="text-sm text-destructive ml-8">{errors.agreePrivacy}</p>
          )}

          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-background transition">
            <Checkbox
              id="agreeDataUsage"
              checked={data.agreeDataUsage}
              onCheckedChange={(checked) =>
                onChange({ ...data, agreeDataUsage: checked as boolean })
              }
              className="mt-1"
            />
            <Label htmlFor="agreeDataUsage" className="font-normal cursor-pointer text-foreground text-sm">
              I consent to ADP using my submitted information and documents for membership review, communication, and compliance needs{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.agreeDataUsage && (
            <p className="text-sm text-destructive ml-8">{errors.agreeDataUsage}</p>
          )}

          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-background transition">
            <Checkbox
              id="declaration"
              checked={data.agreeDeclaration}
              onCheckedChange={(checked) =>
                onChange({ ...data, agreeDeclaration: checked as boolean })
              }
              className="mt-1"
            />
            <Label htmlFor="declaration" className="font-normal cursor-pointer text-foreground text-sm">
              I declare that all information provided is accurate and complete.
              I consent to data processing as per ADP privacy policy{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.agreeDeclaration && (
            <p className="text-sm text-destructive ml-8">{errors.agreeDeclaration}</p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-secondary/40 p-4 rounded-lg space-y-2 text-sm">
        <h3 className="font-semibold text-foreground">Contact Information</h3>
        <p className="text-muted-foreground">
          Website:{" "}
          <a href="https://www.adp.org.in/" className="text-primary hover:underline">
            www.adp.org.in
          </a>
        </p>
        <p className="text-muted-foreground">
          Email:{" "}
          <a href="mailto:info@adp.org.in" className="text-primary hover:underline">
            info@adp.org.in
          </a>
        </p>
        <p className="text-muted-foreground">
          WhatsApp:{" "}
          <a
            href="https://wa.me/918059655000?text=Hello%20I%20need%20assistance%20regarding%20your%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            +91 80596 55000
          </a>
        </p>
      </div>

      {/* Security Verification Section */}
      <div className="bg-secondary/40 rounded-xl p-6 space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center">
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-2">
            3
          </span>
          Security Verification <span className="text-destructive">*</span>
        </h4>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the security code below to verify you are human
          </p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-foreground block mb-2">
                Captcha Code
              </Label>
              <div className="bg-primary/10 p-4 rounded-lg font-mono font-bold text-xl tracking-widest text-center border border-primary/30 select-none text-foreground">
                {data.captchaCode}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateCaptcha()}
            >
              ↻ Reload
            </Button>
          </div>
          <div>
            <Label
              htmlFor="captcha-input"
              className="text-sm font-medium text-foreground block mb-2"
            >
              Enter Code Above
            </Label>
            <Input
              id="captcha-input"
              placeholder="Enter the text shown above"
              value={data.captcha}
              onChange={(e) =>
                onChange({ ...data, captcha: e.target.value.toUpperCase() })
              }
              className={errors.captcha ? "border-destructive" : ""}
            />
            {errors.captcha && (
              <p className="text-sm text-destructive mt-1">{errors.captcha}</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg text-sm text-yellow-900 dark:text-yellow-200">
        <p className="font-semibold mb-2">Security Warning</p>
        <p>
          Do not submit confidential information such as credit card details,
          OTPs, or passwords through this form.
        </p>
      </div>

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
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 font-semibold"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
