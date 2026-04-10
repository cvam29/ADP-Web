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
        <h2 className="text-xl font-semibold text-slate-900">
          Payment Information
        </h2>
        <p className="text-sm text-slate-600">
          Complete your payment of{" "}
          <span className="font-bold text-slate-800">
            {formatCurrency(priceWithGST)}
          </span>{" "}
          using any of the methods below and upload the receipt.
        </p>

        {/* Invoice Breakdown */}
        {selectedPlan && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-4 max-w-md">
            <h3 className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Plan</span>
                <span className="font-medium text-slate-900">
                  {selectedPlan.name}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Price</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(price)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(priceWithGST - price)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-2 border-t border-slate-100 mt-2">
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
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
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
            <div className="bg-white p-4 rounded-lg shadow-md">
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
            <Label className="text-xs text-slate-600 font-medium">UPI ID</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={UPI_ID}
                className="font-mono text-sm bg-white"
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

          <p className="text-xs text-center text-slate-600 bg-white/50 p-2 rounded">
            Association of Dietetics Professionals
          </p>
        </div>

        {/* Bank Details Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Bank Transfer Details
          </h3>

          <div className="space-y-3 bg-white/70 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-600">Bank:</span>
              <span className="font-medium text-sm text-right">Saraswat Bank (Current Account)</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-600">Account Holder:</span>
              <span className="font-medium text-sm text-right max-w-[200px]">
                Association of Dietetics Professionals
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm">
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
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-600">IFSC Code:</span>
              <span className="font-medium font-mono text-sm">SRCB0000494</span>
            </div>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-800 font-medium">
              💡 Payment Instructions:
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
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
          Upload Payment Receipt <span className="text-red-500">*</span>
        </Label>
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer"
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
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {data.receiptFile
                ? "Click to change receipt"
                : "Click to upload receipt"}
            </p>
            <p className="text-xs text-slate-500">
              JPG, PNG or PDF (max. 10MB)
            </p>
            {data.receiptFile && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-300 rounded-md">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">
                  {data.receiptFile.name}
                </span>
                <span className="text-xs text-emerald-600">
                  ({(data.receiptFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-semibold"
        >
          Continue to Declaration →
        </Button>
      </div>
    </div>
  );
}
