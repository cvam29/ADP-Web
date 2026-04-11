"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Smartphone, Download, Copy, Check } from "lucide-react";

import type { MembershipPlanDto } from "@/services/generated";
import { formatCurrency } from "@/lib/currency";

interface PaymentData {
  receiptFile: File | null;
}

interface StepPaymentProps {
  data: PaymentData;
  selectedPlan?: MembershipPlanDto;
  onChange: (data: PaymentData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepPayment({
  data,
  selectedPlan,
  onChange,
  onBack,
  onNext,
}: StepPaymentProps) {
  const [error, setError] = useState("");
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const price = selectedPlan?.price ?? 0;
  const priceWithGST =
    selectedPlan?.priceWithGST && selectedPlan.priceWithGST > 0
      ? selectedPlan.priceWithGST
      : price;

  const UPI_ID = "DIETETICSPROFESSION@SRCB";
  const QR_CODE_URL =
    "https://adpblobstorage.blob.core.windows.net/adpcontainer/Payment/Qr-Code/img7.jpg";
  const PAYMENT_METHODS_URL =
    "https://adpblobstorage.blob.core.windows.net/adpcontainer/Payment/Qr-Code/payment-methods.avif";

  const validateStep = () => {
    if (!data.receiptFile) {
      setError("Please upload fee receipt");
      return false;
    }
    setError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...data,
        receiptFile: file,
      });
      setError("");
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI ID:", err);
    }
  };

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText("12345678901234");
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch (err) {
      console.error("Failed to copy account number:", err);
    }
  };

  const handleDownloadQR = () => {
    window.open(QR_CODE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          Payment Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Complete your payment of{" "}
          <span className="font-bold text-foreground">
            {formatCurrency(priceWithGST)}
          </span>{" "}
          using any of the methods below and upload the receipt.
        </p>

        {/* Invoice Breakdown */}
        {selectedPlan && (
          <div className="bg-card p-4 rounded-xl shadow-sm border border-border mt-4 max-w-md">
            <h3 className="font-semibold text-foreground mb-3 border-b border-border pb-2">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Plan</span>
                <span className="font-medium text-foreground">
                  {selectedPlan.name}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Base Price</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(price)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (18%)</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(priceWithGST - price)}
                </span>
              </div>
              <div className="flex justify-between text-primary font-bold pt-2 border-t border-border mt-2">
                <span>Total Amount</span>
                <span className="text-lg">{formatCurrency(priceWithGST)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code & UPI Section */}
        <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Scan & Pay
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadQR}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-card p-4 rounded-lg shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QR_CODE_URL}
                alt="Payment QR Code"
                className="w-48 h-48 object-contain"
                width={192}
                height={192}
              />
            </div>
          </div>

          {/* UPI ID */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">UPI ID</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={UPI_ID}
                className="font-mono text-sm bg-card"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUPI}
                className="shrink-0"
              >
                {copiedUPI ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex justify-center pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PAYMENT_METHODS_URL}
              alt="Supported Payment Methods"
              className="w-full max-w-xs object-contain"
            />
          </div>

          <p className="text-xs text-center text-muted-foreground bg-background/50 p-2 rounded">
            Association of Dietetics Professionals
          </p>
        </div>

        {/* Bank Details Section */}
        <div className="bg-secondary/40 p-6 rounded-xl border-2 border-border space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Bank Transfer Details
          </h3>

          <div className="space-y-3 bg-card/70 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Bank:</span>
              <span className="font-medium text-sm text-right text-foreground">Saraswat Bank (Current Account)</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Account Holder:</span>
              <span className="font-medium text-sm text-right max-w-[200px] text-foreground">
                Association of Dietetics Professionals
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm text-foreground">
                  6100000000574900494
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAccount}
                  className="h-6 w-6 p-0"
                >
                  {copiedAccount ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">IFSC Code:</span>
              <span className="font-medium font-mono text-sm text-foreground">SRCB0000494</span>
            </div>
          </div>

          <div className="bg-secondary border border-border rounded-lg p-3 mt-4">
            <p className="text-xs text-foreground font-medium">
              Payment Instructions:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
              <li>Transfer the membership fee to the account above</li>
              <li>Save the transaction receipt/screenshot</li>
              <li>Upload the receipt below to complete registration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="space-y-3">
        <Label htmlFor="receipt" className="text-base font-semibold">
          Upload Payment Receipt <span className="text-destructive">*</span>
        </Label>
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
          onClick={() => document.getElementById("receipt")?.click()}
        >
          <input
            id="receipt"
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">
              {data.receiptFile
                ? "Click to change receipt"
                : "Click to upload receipt"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or PDF (max. 10MB)
            </p>
            {data.receiptFile && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-md">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {data.receiptFile.name}
                </span>
                <span className="text-xs text-primary/80">
                  ({(data.receiptFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6"
        >
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          className="px-8 font-semibold"
        >
          Continue to Declaration →
        </Button>
      </div>
    </div>
  );
}
