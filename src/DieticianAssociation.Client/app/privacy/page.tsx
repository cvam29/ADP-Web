import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export const metadata: Metadata = {
  title: "Privacy Policy | Association of Dietetics Professionals",
  description:
    "How we collect, use, and protect your personal information at the Association of Dietetics Professionals.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-slate-600 text-lg">
              Your privacy matters. We are committed to protecting your personal information.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
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
                The Association of Dietetics Professionals respects your privacy and is committed to protecting the personal
                information you share with us.
              </p>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Information We Collect</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personal and professional details</li>
                  <li>Contact info</li>
                  <li>Educational qualifications</li>
                  <li>Payment info (via secure gateways)</li>
                  <li>Login credentials</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Membership verification and processing</li>
                  <li>Communication about updates/events</li>
                  <li>Issuing certificates</li>
                  <li>Compliance with obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Information Sharing</h2>
                <p>
                  No selling or renting. Shared only with authorized staff, service providers, or regulatory authorities if
                  required.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Data Security & Retention</h2>
                <p>We use secure servers and encryption. Data retained only as long as necessary.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your Rights</h2>
                <p>
                  You may request access, correction, deletion, or withdraw consent. Email: <a className="underline" href="mailto:info@adp.org.in">info@adp.org.in</a>
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Cookies & Third-Party Links</h2>
                <p>Our site may use cookies and link to external websites not under our control.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
