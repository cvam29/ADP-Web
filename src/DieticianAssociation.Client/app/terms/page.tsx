import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export const metadata: Metadata = {
  title: "Terms of Service | Association of Dietetics Professionals",
  description: "The terms and conditions for using our website and services.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
            <p className="text-slate-600 text-lg">
              By using our website and services, you agree to the following terms.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-slate-600">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-slate-900">Effective Date:</strong> 05/07/2025
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-slate-900">Last Updated:</strong> 18/09/2025
                </p>
              </div>

              <p>
                By accessing or using the Association of Dietetics Professionals website, you agree to these Terms of Service.
              </p>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Eligibility for Membership</h2>
                <p>Membership is open to qualified professionals. Credentials must be accurate and verifiable.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Membership Categories</h2>
                <p>Categories include Student, Active, Life, and Honorary. Benefits vary by category.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Fees & Payments</h2>
                <p>
                  Fees must be paid in full. Processed securely via third-party gateways. Non-refundable except for administrative
                  errors.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Obligations of Members</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Uphold professional standards</li>
                  <li>Provide accurate details</li>
                  <li>No sharing of login credentials</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Conduct & Disciplinary Action</h2>
                <p>Misconduct may lead to suspension or termination of membership without refund.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Use of Website</h2>
                <p>
                  Intended for professional use. Unauthorized activities prohibited. All content is Association property unless stated
                  otherwise.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Limitation of Liability</h2>
                <p>We strive for accuracy but are not liable for damages arising from use of this site.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Termination</h2>
                <p>Membership may be terminated voluntarily, for non-payment, or due to policy violations.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Governing Law</h2>
                <p>These Terms are governed by the laws of India (jurisdiction: New Delhi).</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Contact</h2>
                <p>
                  Email: <a className="underline" href="mailto:info@adp.org.in">info@adp.org.in</a> <br />
                  Address: New Delhi, India <br />
                  Phone: +91 8059655000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
