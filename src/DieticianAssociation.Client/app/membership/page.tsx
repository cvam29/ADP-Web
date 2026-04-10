import type { Metadata } from "next"
import { MembershipPlans } from "@/components/membership-plans";
import { MembershipBenefits } from "@/components/membership-benefits";
import { MembershipTestimonials } from "@/components/membership-testimonials";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Join the Association of Dietetics Professionals — explore membership plans, benefits, and testimonials from our community.",
  openGraph: {
    title: "Membership | Association of Dietetics Professionals",
    description:
      "Join the Association of Dietetics Professionals — explore membership plans, benefits, and testimonials from our community.",
  },
  alternates: { canonical: "/membership/" },
}

export default function MembershipPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Join Our Professional Community
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Advance your career with access to exclusive resources, continuing
            education, networking opportunities, and professional development
            programs.
          </p>
        </div>
      </section>

      <MembershipPlans />
      <MembershipBenefits />
      <MembershipTestimonials />
    </div>
  );
}
