"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MembershipConfirmationPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email address";
  const applicationRequestId =
    searchParams.get("applicationRequestId") ?? "Pending";
  const confirmationSent = searchParams.get("confirmationSent") === "true";
  const message =
    searchParams.get("message") ??
    "Membership application submitted successfully. Our team will review your request and payment before activation.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <Badge className="mb-3 bg-amber-100 text-amber-800 hover:bg-amber-100">
              Review Pending
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Membership request received
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{message}</p>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl bg-slate-50 p-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Application email</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Membership request ID</p>
            <p className="mt-2 break-all text-base font-semibold text-slate-900">
              {applicationRequestId}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex gap-3">
            <Clock3 className="mt-1 h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-slate-900">What happens next</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Our team will review your documents, verify your payment, and activate your membership after approval.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <MailCheck className="mt-1 h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Confirmation email</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {confirmationSent
                  ? `A confirmation email has been sent to ${email}.`
                  : "Your request was saved, but the confirmation email could not be sent right now. Please contact ADP support if you do not hear from us."}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Login credentials</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Temporary login credentials are sent only after your membership is approved.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/">Return to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}