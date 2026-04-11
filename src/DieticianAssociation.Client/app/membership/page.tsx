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
      <section className="border-b border-border bg-secondary/30 py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Membership
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 text-balance">
            Join Our Professional Community
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
